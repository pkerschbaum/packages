import * as commander from '@commander-js/extra-typings';
import fs from 'node:fs';

import { rewriteModuleSpecifiersOfTypeScriptProject } from '#pkg/transform/index';

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

  const filesWithModuleSpecifierMaps = await rewriteModuleSpecifiersOfTypeScriptProject({
    project: options.project,
    basepath: options.basepath,
  });

  const limit = pLimit(10);
  const input = filesWithModuleSpecifierMaps.map((entry) =>
    limit(async () => {
      return await fs.promises.writeFile(entry.absolutePathSourceFile, entry.newText);
    }),
  );

  await Promise.all(input);
}

void run();
