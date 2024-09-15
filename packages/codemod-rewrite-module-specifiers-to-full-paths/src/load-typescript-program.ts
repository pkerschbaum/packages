import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

export function loadTypeScriptProgram(opts: { project: string; basepath?: string | undefined }) {
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

  return {
    compilerOptions,
    pathsContext,
    fileNames,
  };
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
