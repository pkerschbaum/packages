import * as commander from '@commander-js/extra-typings';
import fs from 'node:fs';

import { transform } from '#pkg/transformer';

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

const filesToWrite: Array<{ absolutePath: string; text: string }> = [];

transform({
  project: options.project,
  basepath: options.basepath,
  writeFile(absolutePath, text) {
    filesToWrite.push({ absolutePath, text });
  },
});

async function run() {
  const { default: pLimit } = await import('p-limit');
  const limit = pLimit(10);
  const input = filesToWrite.map(({ absolutePath, text }) =>
    limit(() => fs.promises.writeFile(absolutePath, text)),
  );

  await Promise.all(input);
}

void run();
