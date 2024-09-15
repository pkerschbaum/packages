import { type TypeScriptProgram } from '#pkg/load-typescript-program';
import { rewriteModuleSpecifiersOfFile } from '#pkg/transform/rewrite-module-specifiers-of-file';
import type { VisitorContext } from '#pkg/transform/types';

export function rewriteModuleSpecifiersOfTypeScriptProject(
  typeScriptProgram: TypeScriptProgram,
  absolutePathSourceFile: string,
  text: string,
): string {
  const visitorContext: VisitorContext = {
    absolutePathSourceFile,
    compilerOptions: typeScriptProgram.compilerOptions,
    paths: typeScriptProgram.pathsContext,
  };

  const newText = rewriteModuleSpecifiersOfFile({ ...visitorContext, text });

  return newText;
}
