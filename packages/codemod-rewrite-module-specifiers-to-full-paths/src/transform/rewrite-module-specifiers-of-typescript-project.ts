import fs from 'node:fs';

import { loadTypeScriptProgram } from '#pkg/load-typescript-program';
import { rewriteModuleSpecifiersOfFile } from '#pkg/transform/rewrite-module-specifiers-of-file';
import type { VisitorContext } from '#pkg/transform/types';

export type RewriteModuleSpecifiersOfTypeScriptProjectResult = Array<{
  absolutePathSourceFile: string;
  newText: string;
}>;

export async function rewriteModuleSpecifiersOfTypeScriptProject(opts: {
  project: string;
  basepath?: string | undefined;
}): Promise<RewriteModuleSpecifiersOfTypeScriptProjectResult> {
  const typeScriptProgram = loadTypeScriptProgram(opts);

  return await Promise.all(
    typeScriptProgram.fileNames.map(async (fileName) => {
      console.log(fileName);
      const visitorContext: VisitorContext = {
        absolutePathSourceFile: fileName,
        compilerOptions: typeScriptProgram.compilerOptions,
        paths: typeScriptProgram.pathsContext,
      };

      const text = await fs.promises.readFile(fileName, 'utf8');

      const newText = rewriteModuleSpecifiersOfFile({ ...visitorContext, text });

      return {
        absolutePathSourceFile: fileName,
        newText,
      };
    }),
  );
}
