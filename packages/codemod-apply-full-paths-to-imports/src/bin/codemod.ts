import * as commander from '@commander-js/extra-typings';

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

transform({ project: options.project, basepath: options.basepath });
