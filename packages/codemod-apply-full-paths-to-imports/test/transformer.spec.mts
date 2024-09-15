import fs from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line import/default -- false positive
import invariant from 'tiny-invariant';
import { test, expect } from 'vitest';

import { determineModuleSpecifierMapsForFiles } from '#pkg/transform/transformer.js';
import { transformer2 } from '#pkg/transform2/transformer2.js';

const PATH_TO_TRANSFORMER_INPUTS = path.join(__dirname, 'transformer-inputs');
const PROJECTS = {
  PROJECT_1_DIRECTORY: path.join(PATH_TO_TRANSFORMER_INPUTS, 'project-1'),
};

test('fixture-1', async () => {
  const projectAbsolutePath = path.join(PROJECTS.PROJECT_1_DIRECTORY, 'tsconfig.json');
  const basepath = path.dirname(projectAbsolutePath);

  const filesWithModuleSpecifierMaps = determineModuleSpecifierMapsForFiles({
    project: projectAbsolutePath,
  });

  const texts = await Promise.all(
    filesWithModuleSpecifierMaps.map((entry) =>
      fs.promises.readFile(entry.absolutePathSourceFile, 'utf8'),
    ),
  );
  const result2 = transformer2(
    filesWithModuleSpecifierMaps.map((entry, index) => {
      const correspondingText = texts[index];
      invariant(correspondingText);
      return {
        text: correspondingText,
        moduleSpecifierMap: entry.moduleSpecifierMap,
      };
    }),
  );

  let idx = -1;
  for (const entry of Object.values(filesWithModuleSpecifierMaps)) {
    idx += 1;
    const relativePathFromRootDir = path.relative(basepath, entry.absolutePathSourceFile);
    await expect(result2[idx]).toMatchFileSnapshot(
      `./transformer-outputs/project-1/${relativePathFromRootDir}`,
    );
  }
});
