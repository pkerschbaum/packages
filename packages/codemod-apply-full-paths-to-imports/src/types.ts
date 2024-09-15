import ts, { CompilerOptions, Pattern } from 'typescript';

export type TsTransformPathsContext = {
  readonly compilerOptions: CompilerOptions;
  readonly paths?:
    | undefined
    | {
        readonly absoluteBasePath: string;
        readonly patterns: ReadonlyArray<string | Pattern>;
      };
};

export type VisitorContext = {
  readonly sourceFile: ts.SourceFile;
} & TsTransformPathsContext;
