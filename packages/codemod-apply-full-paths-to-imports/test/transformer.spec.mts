import path from 'node:path';
import { test, expect } from 'vitest';

import { rewriteModuleSpecifiersOfTypeScriptProject } from '#pkg/transform/index.js';

const PATH_TO_TRANSFORMER_INPUTS = path.join(__dirname, 'transformer-inputs');
const PROJECTS = {
  PROJECT_1_DIRECTORY: path.join(PATH_TO_TRANSFORMER_INPUTS, 'project-1'),
};

test('fixture-1', async () => {
  const projectAbsolutePath = path.join(PROJECTS.PROJECT_1_DIRECTORY, 'tsconfig.json');
  const basepath = path.dirname(projectAbsolutePath);

  const filesWithModuleSpecifierMaps = await rewriteModuleSpecifiersOfTypeScriptProject({
    project: projectAbsolutePath,
  });

  for (const entry of Object.values(filesWithModuleSpecifierMaps)) {
    const relativePathFromRootDir = path.relative(basepath, entry.absolutePathSourceFile);
    await expect(entry.newText).toMatchFileSnapshot(
      `./transformer-outputs/project-1/${relativePathFromRootDir}`,
    );
  }
});
