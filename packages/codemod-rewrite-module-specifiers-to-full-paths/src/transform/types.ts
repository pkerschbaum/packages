import ts from 'typescript';

export type VisitorContext = {
  absolutePathSourceFile: string;
  compilerOptions: ts.CompilerOptions;
  paths?:
    | undefined
    | {
        absoluteBasePath: string;
        patterns: ReadonlyArray<string | ts.Pattern>;
      };
};
