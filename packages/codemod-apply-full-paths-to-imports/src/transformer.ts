import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

export function transform(opts: {
  project: string;
  basepath?: string | undefined;
  writeFile: (absolutePath: string, text: string) => void;
}) {
  const projectAbsolutePath = path.resolve(opts.project);
  const basepath = opts.basepath ?? path.dirname(projectAbsolutePath);

  const configFile = ts.readConfigFile(projectAbsolutePath, ts.sys.readFile.bind(ts.sys));
  invariant(configFile.config, 'expected to find config, but did not');
  const { options, fileNames } = ts.parseJsonConfigFileContent(configFile.config, ts.sys, basepath);

  let patterns = options.configFile?.configFileSpecs?.pathPatterns;
  if (options.paths) {
    patterns = ts.tryParsePatterns(options.paths);
  }

  // based on https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#customizing-module-resolution
  const program = ts.createProgram(
    fileNames,
    { ...options, incremental: false },
    {
      ...ts.sys,
      getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget) => {
        const sourceText = ts.sys.readFile(fileName);
        if (sourceText === undefined) {
          return undefined;
        }

        const sourceFile = ts.createSourceFile(fileName, sourceText, languageVersion);

        // implement visitor
        ts.visitEachChild(sourceFile);

        // call opts.writeFile callback with `fileName` and SourceFile transformed to text
        return sourceFile;
      },
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
      getDefaultLibFileName: () => 'lib.d.ts',
      getCanonicalFileName: (fileName) =>
        ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
      getNewLine: () => ts.sys.newLine,
      resolveModuleNames: (moduleNames: string[], containingFile: string) => {
        const resolvedModules: Array<ts.ResolvedModule | undefined> = [];
        for (const moduleName of moduleNames) {
          let patternStuff:
            | { patternMatched: string | ts.Pattern; patternText: string | undefined }
            | undefined;
          if (patterns) {
            const patternMatched = ts.matchPatternOrExact(patterns, moduleName);
            if (patternMatched) {
              patternStuff = {
                patternMatched,
                patternText:
                  typeof patternMatched === 'string' ? undefined : ts.patternText(patternMatched),
              };
            }
          }
          // try to use standard resolution
          const result = ts.resolveModuleName(moduleName, containingFile, options, {
            fileExists: ts.sys.fileExists.bind(ts.sys),
            readFile: ts.sys.readFile.bind(ts.sys),
          });
          if (result.resolvedModule) {
            resolvedModules.push(result.resolvedModule);
          } else {
            resolvedModules.push(undefined);
          }
        }
        return resolvedModules;
      },
    },
  );

  const emitResult = program.emit(undefined, () => {});

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  if (exitCode !== 0) {
    throw new Error(`exitCode=${exitCode}`);
  }
}
