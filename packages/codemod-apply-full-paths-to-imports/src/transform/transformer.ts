import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

import { functions } from '@pkerschbaum/commons-ecma/util/functions';

import type { VisitorContext } from '#pkg/transform/types';
import { createNodeVisitor } from '#pkg/transform/visitor';

export function transform(opts: {
  project: string;
  basepath?: string | undefined;
}): Array<{ absolutePath: string; text: string }> {
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

  const result: Array<{ absolutePath: string; text: string }> = [];

  const program = ts.createProgram(fileNames, compilerOptions, {
    ...ts.sys,
    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget) => {
      const sourceText = ts.sys.readFile(fileName);
      if (sourceText === undefined) {
        return undefined;
      }

      const sourceFile = ts.createSourceFile(fileName, sourceText, languageVersion);

      const visitorContext: VisitorContext = {
        compilerOptions,
        paths: pathsContext,
        sourceFile,
      };

      const newSourceFile = ts.visitNode(sourceFile, createNodeVisitor(visitorContext));
      invariant(newSourceFile);
      invariant(ts.isSourceFile(newSourceFile));

      result.push({
        absolutePath: fileName,
        text: ts.createPrinter().printNode(ts.EmitHint.SourceFile, newSourceFile, newSourceFile),
      });

      return sourceFile;
    },
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    getDefaultLibFileName: () => 'lib.d.ts',
    getCanonicalFileName: (fileName) =>
      ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    getNewLine: () => ts.sys.newLine,
  });

  const emitResult = program.emit(
    undefined,
    /* avoid emitting any files by passing a noop function to the "writeFile" argument */
    functions.noop,
  );

  invariant(
    !emitResult.emitSkipped,
    'The TypeScript Compiler API skipped emitting some files, which means some error occured. Please ensure the TypeScript project can be compiled successfully.',
  );

  return result;
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