import ts from 'typescript';

export type VisitorContext = {
  compilerOptions: ts.CompilerOptions;
  paths?:
    | undefined
    | {
        absoluteBasePath: string;
        patterns: ReadonlyArray<string | ts.Pattern>;
      };
  sourceFile: ts.SourceFile;
  moduleSpecifierMap: Map<
    /* original module specifier */
    string,
    /* new module specifier*/
    string
  >;
};
