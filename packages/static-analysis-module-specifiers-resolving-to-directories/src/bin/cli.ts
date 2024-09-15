import '@pkerschbaum/runtime-extensions-node';

import * as commander from '@commander-js/extra-typings';
import { glob } from 'glob';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import invariant from 'tiny-invariant';

import { collectModuleSpecifiersOfFileVisitor } from '#pkg/transform/collect-module-specifiers-of-file-visitor';

const commanderProgram = new commander.Command().addOption(
  new commander.Option('--glob <pattern>').makeOptionMandatory(),
);
commanderProgram.parse();
const options = commanderProgram.opts();

async function run() {
  const { default: pLimit } = await import('p-limit');
  const { $ } = await import('zx');

  const files = await glob(options.glob, { dot: true });

  const limit = pLimit(10);
  const operations = files.map((relativePathToFile) =>
    limit(async () => {
      const absolutePathToFile = path.resolve(relativePathToFile);
      const stat = await fs.promises.stat(absolutePathToFile);
      if (!stat.isFile()) {
        return;
      }

      const text = await fs.promises.readFile(absolutePathToFile, 'utf8');
      let collectedModuleSpecifiers;
      try {
        collectedModuleSpecifiers = collectModuleSpecifiersOfFileVisitor({ text });
      } catch {
        // ignore parsing errors
        return;
      }

      const dirnameOfFile = path.dirname(absolutePathToFile);
      const extOfFile = path.extname(absolutePathToFile);
      const probeFilePath = `${path.join(dirnameOfFile, `probe-${randomUUID()}`)}${extOfFile}`;
      try {
        await fs.promises.writeFile(
          probeFilePath,
          `
  const moduleSpecifiers = ${JSON.stringify(collectedModuleSpecifiers, null, 2)};
  for (const moduleSpecifier of moduleSpecifiers) {
    console.log(\`moduleSpecifier=\${moduleSpecifier}, resolvedToURL=\${import.meta.resolve(moduleSpecifier)}\`);
  }
  `,
          'utf8',
        );
      } catch (error) {
        console.log(error);
      }
      const stdout = (await $`node ${probeFilePath}`).stdout.trim();
      const moduleSpecifierAndResolvedTo = stdout
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const [moduleSpecifierStr, resolvedToURL] = line.split(', resolvedToURL=');
          invariant(moduleSpecifierStr, `line=${line}`);
          invariant(resolvedToURL);
          const moduleSpecifier = moduleSpecifierStr.slice('moduleSpecifier='.length);
          return { moduleSpecifier, resolvedToURL };
        });

      for (const { moduleSpecifier, resolvedToURL } of moduleSpecifierAndResolvedTo) {
        if (!resolvedToURL.startsWith('file://')) {
          continue;
        }

        const resolvedToPath = url.fileURLToPath(resolvedToURL);
        if (!path.isAbsolute(resolvedToPath)) {
          continue;
        }

        const stat = await fs.promises.stat(resolvedToPath);
        if (stat.isDirectory()) {
          console.log(
            `Module specifier "${moduleSpecifier}" in file "${absolutePathToFile}" resolves to directory "${resolvedToPath}"`,
          );
        }
      }
    }),
  );
  await Promise.all(operations);
}

void run();
