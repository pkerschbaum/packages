import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

import type { VisitorContext } from '#pkg/types';
import { createNodeVisitor } from '#pkg/visitor';

export function transform(opts: {
  project: string;
  basepath?: string | undefined;
  writeFile: (absolutePath: string, text: string) => void;
}) {
  const projectAbsolutePath = path.resolve(opts.project);
  const basepath = opts.basepath ?? path.dirname(projectAbsolutePath);

  const configFile = ts.readConfigFile(projectAbsolutePath, ts.sys.readFile.bind(ts.sys));
  invariant(configFile.config, 'expected to find config, but did not');
  const { options: compilerOptions, fileNames } = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    basepath,
  );

  let pathsPatterns = compilerOptions.configFile?.configFileSpecs?.pathPatterns;
  if (compilerOptions.paths) {
    pathsPatterns = ts.tryParsePatterns(compilerOptions.paths);
  }

  // based on https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#customizing-module-resolution
  const program = ts.createProgram(
    fileNames,
    { ...compilerOptions, incremental: false },
    {
      ...ts.sys,
      getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget) => {
        const sourceText = ts.sys.readFile(fileName);
        if (sourceText === undefined) {
          return undefined;
        }

        const sourceFile = ts.createSourceFile(fileName, sourceText, languageVersion);

        const visitorContext: VisitorContext = {
          compilerOptions,
          paths: !pathsPatterns
            ? undefined
            : {
                absoluteBasePath: compilerOptions.baseUrl
                  ? path.join(compilerOptions.pathsBasePath!, compilerOptions.baseUrl)
                  : compilerOptions.pathsBasePath!,
                patterns: pathsPatterns,
              },
          sourceFile,
        };

        const newSourceFile = ts.visitNode(sourceFile, createNodeVisitor(visitorContext));
        invariant(newSourceFile);

        opts.writeFile(
          fileName,
          ts
            .createPrinter()
            .printNode(ts.EmitHint.Unspecified, newSourceFile, newSourceFile as ts.SourceFile),
        );

        return sourceFile;
      },
      useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
      getDefaultLibFileName: () => 'lib.d.ts',
      getCanonicalFileName: (fileName) =>
        ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
      getNewLine: () => ts.sys.newLine,
    },
  );

  const emitResult = program.emit(undefined, () => {});

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  if (exitCode !== 0) {
    throw new Error(`exitCode=${exitCode}`);
  }
}
