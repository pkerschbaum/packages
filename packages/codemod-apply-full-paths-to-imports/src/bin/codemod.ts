import * as commander from '@commander-js/extra-typings';
import fs from 'node:fs';
import invariant from 'tiny-invariant';

import { determineModuleSpecifierMapsForFiles } from '#pkg/transform/transformer';
import { transformer2 } from '#pkg/transform2/transformer2';

const commanderProgram = new commander.Command()
  .addOption(
    new commander.Option(
      '--project <path-to-tsconfig-json>',
      'Path to the TypeScript configuration file (e.g. "./tsconfig.json").',
    ).makeOptionMandatory(),
  )
  .addOption(
    new commander.Option(
      '--basepath <path>',
      'A root directory to resolve relative path entries in the TypeScript config file to (e.g. option "outDir"). If omitted, the directory of the TypeScript configuration file passed with "--project" is used.',
    ),
  );
commanderProgram.parse();
const options = commanderProgram.opts();

async function run() {
  const { default: pLimit } = await import('p-limit');

  const filesWithModuleSpecifierMaps = determineModuleSpecifierMapsForFiles({
    project: options.project,
    basepath: options.basepath,
  });

  const texts = await Promise.all(
    filesWithModuleSpecifierMaps.map((entry) =>
      fs.promises.readFile(entry.absolutePathSourceFile, 'utf8'),
    ),
  );
  const newTexts = transformer2(
    filesWithModuleSpecifierMaps.map((entry, index) => {
      const correspondingText = texts[index];
      invariant(correspondingText);
      return {
        text: correspondingText,
        moduleSpecifierMap: entry.moduleSpecifierMap,
      };
    }),
  );

  const limit = pLimit(10);
  const input = filesWithModuleSpecifierMaps.map((entry, idx) =>
    limit(async () => {
      const correspondingNewText = newTexts[idx];
      invariant(correspondingNewText);
      return await fs.promises.writeFile(entry.absolutePathSourceFile, correspondingNewText);
    }),
  );

  await Promise.all(input);
}

void run();
