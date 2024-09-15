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
  const res = resolveModuleName(context, moduleName);
  if (!res) {
    return node;
  }

  const { resolvedPath, newModuleName } = res;

  /* Skip if matches exclusion */
  if (context.excludeMatchers) {
    for (const matcher of context.excludeMatchers) {
      // eslint-disable-next-line unicorn/prefer-regexp-test -- false positive
      if (resolvedPath && matcher.match(resolvedPath)) {
        return node;
      }
    }
  }

  return updaterFn(ts.factory.createStringLiteral(newModuleName));
}
