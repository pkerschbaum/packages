import ts from 'typescript';

import { VisitorContext } from '#pkg/types';
import { resolveModuleName } from '#pkg/utils/resolve-module-name';

/** Gets proper path and calls updaterFn to get the new node if it should be updated */
export function resolvePathAndUpdateNode(
  context: VisitorContext,
  node: ts.Node,
  moduleName: string,
  updaterFn: (newPath: ts.StringLiteral) => ts.Node | undefined,
): ts.Node | undefined {
  let pathsPatternMatched = false;
  if (context.paths) {
    pathsPatternMatched = !!ts.matchPatternOrExact(context.paths.patterns, moduleName);
  }
  // ignore `moduleName`s which are not absolute paths, relative paths, or "paths" pattern
  if (!moduleName.startsWith('/') && !moduleName.startsWith('.') && !pathsPatternMatched) {
    return node;
  }

  const res = resolveModuleName(context, moduleName);
  if (!res) {
    return node;
  }

  const { newModuleName } = res;

  return updaterFn(ts.factory.createStringLiteral(newModuleName));
}
