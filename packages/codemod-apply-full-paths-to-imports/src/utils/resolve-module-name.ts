import path from 'node:path';
import ts from 'typescript';

import { VisitorContext } from '#pkg/types';

export type ResolvedModule = {
  /** Absolute path to resolved module */
  resolvedPath: string | undefined;
  /**  New module name */
  newModuleName: string;
};

enum IndexType {
  NonIndex,
  Explicit,
  Implicit,
  ImplicitPackage,
}

function getPathDetail(moduleName: string, resolvedModule: ts.ResolvedModuleFull) {
  const resolvedFileName = resolvedModule.originalPath ?? resolvedModule.resolvedFileName;
  const implicitPackageIndex = resolvedModule.packageId?.subModuleName;

  const resolvedDir = implicitPackageIndex
    ? ts.removeSuffix(resolvedFileName, `/${implicitPackageIndex}`)
    : path.dirname(resolvedFileName);
  const resolvedBaseName = implicitPackageIndex ? void 0 : path.basename(resolvedFileName);
  const resolvedBaseNameNoExtension = resolvedBaseName && ts.removeFileExtension(resolvedBaseName);
  const resolvedExtName = resolvedBaseName && path.extname(resolvedFileName);

  let baseName = implicitPackageIndex ? void 0 : path.basename(moduleName);
  let baseNameNoExtension = baseName && ts.removeFileExtension(baseName);
  let extName = baseName && path.extname(moduleName);

  /*
   * Account for possible false extensions. Example scenario:
   *   moduleName = './file.accounting'
   *   resolvedBaseName = 'file.accounting.ts'
   * ('accounting' would be considered the extension)
   */
  if (resolvedBaseNameNoExtension && baseName && resolvedBaseNameNoExtension === baseName) {
    baseNameNoExtension = baseName;
    extName = void 0;
  }

  // prettier-ignore
  const indexType =
    implicitPackageIndex ? IndexType.ImplicitPackage :
      baseNameNoExtension === 'index' && resolvedBaseNameNoExtension === 'index' ? IndexType.Explicit :
        baseNameNoExtension !== 'index' && resolvedBaseNameNoExtension === 'index' ? IndexType.Implicit :
          IndexType.NonIndex;

  if (indexType === IndexType.Implicit) {
    baseName = void 0;
    baseNameNoExtension = void 0;
    extName = void 0;
  }

  return {
    baseName,
    baseNameNoExtension,
    extName,
    resolvedBaseName,
    resolvedBaseNameNoExtension,
    resolvedExtName,
    resolvedDir,
    indexType,
    implicitPackageIndex,
    resolvedFileName,
  };
}

/** Resolve a module name */
export function resolveModuleName(
  context: VisitorContext,
  moduleName: string,
): ResolvedModule | undefined {
  const { compilerOptions, sourceFile, pathsPatterns } = context;

  const { resolvedModule } = ts.resolveModuleName(
    moduleName,
    sourceFile.fileName,
    compilerOptions,
    ts.sys,
  );

  if (!resolvedModule) {
    return undefined;
  }

  const { resolvedFileName } = getPathDetail(moduleName, resolvedModule);

  return { resolvedPath: resolvedFileName, newModuleName };
}
