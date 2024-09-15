import ts from 'typescript';

export type VisitorContext = {
  readonly compilerOptions: ts.CompilerOptions;
  readonly paths?:
    | undefined
    | {
        readonly absoluteBasePath: string;
        readonly patterns: ReadonlyArray<string | ts.Pattern>;
      };
  readonly sourceFile: ts.SourceFile;
};
