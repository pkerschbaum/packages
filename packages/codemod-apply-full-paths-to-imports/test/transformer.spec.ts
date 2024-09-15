import test, { expect } from '@playwright/test';
import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

import { transform } from '#pkg/transformer';

const PATH_TO_TRANSFORMER_INPUTS = path.join(__dirname, 'transformer-inputs');
const PROJECTS = {
  PROJECT_1_DIRECTORY: path.join(PATH_TO_TRANSFORMER_INPUTS, 'project-1'),
};

test('fixture-1', () => {
  const projectAbsolutePath = path.join(PROJECTS.PROJECT_1_DIRECTORY, 'tsconfig.json');
  const configFile = ts.readConfigFile(projectAbsolutePath, ts.sys.readFile.bind(ts.sys));
  invariant(configFile.config, 'expected to find config, but did not');
  const basepath = path.dirname(projectAbsolutePath);
  const { options: compilerOptions, fileNames } = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    basepath,
  );
  const rootDirAbsolutePath = compilerOptions.rootDir
    ? path.join(basepath, compilerOptions.rootDir)
    : longestCommonPrefix(fileNames);
  transform({
    project: projectAbsolutePath,
    writeFile(fileAbsolutePath, text) {
      const relativePathFromRootDir = path.relative(rootDirAbsolutePath, fileAbsolutePath);
      expect(text).toMatchSnapshot(`/transformer-outputs/project-1/${relativePathFromRootDir}`);
    },
  });
});

function longestCommonPrefix(strings: string[]): string {
  // check border cases size 1 array and empty first word)
  if (!strings[0] || strings.length == 1) {
    return strings[0] || '';
  }
  let i = 0;
  // while all words have the same character at position i, increment i
  while (strings[0][i] && strings.every((w) => w[i] === strings[0]?.[i])) {
    i++;
  }

  // prefix is the substring from the beginning to the last successfully checked i
  return strings[0].slice(0, Math.max(0, i));
}
