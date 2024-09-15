import path from 'node:path';
import { test, expect } from 'vitest';

import { transform } from '#pkg/transformer';

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
    await expect(collectedFile.text).toMatchFileSnapshot(
      `./transformer-outputs/project-1/${relativePathFromRootDir}`,
    );
  }
});
