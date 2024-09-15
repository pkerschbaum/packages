import fs from 'node:fs';
import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

import { rewriteModuleSpecifiersOfFile } from '#pkg/transform/rewrite-module-specifiers-of-file';
import type { VisitorContext } from '#pkg/transform/types';

export type RewriteModuleSpecifiersOfTypeScriptProjectResult = Array<{
  absolutePathSourceFile: string;
  newText: string;
}>;

export async function rewriteModuleSpecifiersOfTypeScriptProject(opts: {
  project: string;
  basepath?: string | undefined;
}): Promise<RewriteModuleSpecifiersOfTypeScriptProjectResult> {
  const projectAbsolutePath = path.resolve(opts.project);
  const basepath = opts.basepath ?? path.dirname(projectAbsolutePath);

  const configFile = ts.readConfigFile(projectAbsolutePath, ts.sys.readFile.bind(ts.sys));
  invariant(
    configFile.config,
    `expected to find config, but couldn't! projectAbsolutePath=${projectAbsolutePath}`,
  );
  const { options: compilerOptions, fileNames } = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    basepath,
  );

  const pathsContext = computePathsContext(compilerOptions);

  return await Promise.all(
    fileNames.map(async (fileName) => {
      console.log(fileName);
      const visitorContext: VisitorContext = {
        absolutePathSourceFile: fileName,
        compilerOptions,
        paths: pathsContext,
      };

      const text = await fs.promises.readFile(fileName, 'utf8');

      const newText = rewriteModuleSpecifiersOfFile({ ...visitorContext, text });

      return {
        absolutePathSourceFile: fileName,
        newText,
      };
    }),
  );
}

function computePathsContext(compilerOptions: ts.CompilerOptions) {
  let pathsPatterns = compilerOptions.configFile?.configFileSpecs?.pathPatterns;
  let absoluteBasePath = undefined;
  if (!compilerOptions.paths) {
    return undefined;
  }

  pathsPatterns = ts.tryParsePatterns(compilerOptions.paths);

  invariant(compilerOptions.pathsBasePath);
  absoluteBasePath = !compilerOptions.baseUrl
    ? compilerOptions.pathsBasePath
    : path.join(compilerOptions.pathsBasePath, compilerOptions.baseUrl);

  return { absoluteBasePath, patterns: pathsPatterns };
}
