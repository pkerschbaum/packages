import { type TypeScriptProgram } from '#pkg/load-typescript-program';
import { rewriteModuleSpecifiersOfFileVisitor } from '#pkg/transform/rewrite-module-specifiers-of-file-visitor';
import type { VisitorContext } from '#pkg/transform/types';

export function rewriteModuleSpecifiersOfTypeScriptProject(
  typeScriptProgram: TypeScriptProgram,
  absolutePathSourceFile: string,
  text: string,
): string {
  const visitorContext: VisitorContext = {
    absolutePathSourceFile,
    compilerOptions: typeScriptProgram.compilerOptions,
    paths: typeScriptProgram.paths,
  };

  const newText = rewriteModuleSpecifiersOfFileVisitor({ ...visitorContext, text });

  return newText;
}
