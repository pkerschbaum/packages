import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from 'vitest';

import { loadTypeScriptProgram } from '#pkg/load-typescript-program.js';
import { rewriteModuleSpecifiersOfTypeScriptProject } from '#pkg/transform/index.js';

const PATH_TO_TRANSFORMER_INPUTS = path.join(__dirname, 'transformer-inputs');

test('project-1', async () => {
  const projectAbsolutePath = path.join(PATH_TO_TRANSFORMER_INPUTS, 'project-1', 'tsconfig.json');
  const basepath = path.dirname(projectAbsolutePath);

  const typeScriptProgram = await loadTypeScriptProgram({ project: projectAbsolutePath, basepath });

  await Promise.all(
    typeScriptProgram.fileNames.map(async (absolutePathSourceFile) => {
      const text = await fs.promises.readFile(absolutePathSourceFile, 'utf8');
      const newText = rewriteModuleSpecifiersOfTypeScriptProject(
        typeScriptProgram,
        absolutePathSourceFile,
        text,
      );
      const relativePathFromRootDir = path.relative(basepath, absolutePathSourceFile);
      await expect(newText).toMatchFileSnapshot(
        `./transformer-outputs/project-1/${relativePathFromRootDir}`,
      );
    }),
  );
});

test('project-2', async () => {
  const projectAbsolutePath = path.join(PATH_TO_TRANSFORMER_INPUTS, 'project-2', 'tsconfig.json');
  const basepath = path.dirname(projectAbsolutePath);

  const typeScriptProgram = await loadTypeScriptProgram({ project: projectAbsolutePath, basepath });

  await Promise.all(
    typeScriptProgram.fileNames.map(async (absolutePathSourceFile) => {
      const text = await fs.promises.readFile(absolutePathSourceFile, 'utf8');
      const newText = rewriteModuleSpecifiersOfTypeScriptProject(
        typeScriptProgram,
        absolutePathSourceFile,
        text,
      );
      const relativePathFromRootDir = path.relative(basepath, absolutePathSourceFile);
      await expect(newText).toMatchFileSnapshot(
        `./transformer-outputs/project-2/${relativePathFromRootDir}`,
      );
    }),
  );
});
