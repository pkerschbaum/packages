import path from 'node:path';
// eslint-disable-next-line import/default -- false positive
import prettier from 'prettier';
import { test, expect } from 'vitest';

import { transform } from '#pkg/transformer.js';

const prettierConfig = await prettier.resolveConfig(__dirname);

const PATH_TO_TRANSFORMER_INPUTS = path.join(__dirname, 'transformer-inputs');
const PROJECTS = {
  PROJECT_1_DIRECTORY: path.join(PATH_TO_TRANSFORMER_INPUTS, 'project-1'),
};

test('fixture-1', async () => {
  const projectAbsolutePath = path.join(PROJECTS.PROJECT_1_DIRECTORY, 'tsconfig.json');
  const basepath = path.dirname(projectAbsolutePath);

  const collectedFiles: Array<{ fileAbsolutePath: string; text: string }> = [];
  transform({
    project: projectAbsolutePath,
    writeFile(fileAbsolutePath, text) {
      collectedFiles.push({ fileAbsolutePath, text });
    },
  });

  for (const collectedFile of collectedFiles) {
    const relativePathFromRootDir = path.relative(basepath, collectedFile.fileAbsolutePath);
    const formatted = await prettier.format(collectedFile.text, {
      ...prettierConfig,
      parser: 'typescript',
    });
    await expect(formatted).toMatchFileSnapshot(
      `./transformer-outputs/project-1/${relativePathFromRootDir}`,
    );
  }
});