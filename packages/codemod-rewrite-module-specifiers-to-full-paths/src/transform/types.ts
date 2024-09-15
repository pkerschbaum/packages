import type { TypeScriptProgram } from '#pkg/load-typescript-program';

export type VisitorContext = {
  absolutePathSourceFile: string;
  compilerOptions: TypeScriptProgram['compilerOptions'];
  paths?: TypeScriptProgram['paths'];
};
