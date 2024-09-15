import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

import { VisitorContext } from '#pkg/types';

export type ResolvedModule = {
  /**  New module name */
  newModuleName: string;
};

/** Resolve a module name */
export function resolveModuleName(
  context: VisitorContext,
  origModuleName: string,
): ResolvedModule | undefined {
  const { resolvedModule } = ts.resolveModuleName(
    origModuleName,
    context.sourceFile.fileName,
    context.compilerOptions,
    ts.sys,
  );

  if (!resolvedModule) {
    return undefined;
  }

  let newModuleName;
  if (context.paths) {
    const matchedPathsPattern = ts.matchPatternOrExact(context.paths.patterns, origModuleName);
    if (
      matchedPathsPattern &&
      // ignore patterns which do not have a star in them and thus, resolve to concrete file(s) anyways
      typeof matchedPathsPattern !== 'string'
    ) {
      if (matchedPathsPattern.suffix !== '') {
        throw new TypeError(`patterns with suffixes are not supported`);
      }
      invariant(context.compilerOptions.paths);
      const pathsArray = context.compilerOptions.paths[ts.patternText(matchedPathsPattern)];
      invariant(pathsArray);

      const absolutePathPrefixesToTry = pathsArray
        .map((pathsElem) => {
          const parsedPattern = ts.tryParsePattern(pathsElem);
          if (!parsedPattern) {
            // invalid pattern
            return undefined;
          }
          const prefix = typeof parsedPattern === 'string' ? parsedPattern : parsedPattern.prefix;
          const suffix = typeof parsedPattern === 'string' ? '' : parsedPattern.suffix;
          if (suffix !== '') {
            throw new TypeError(`patterns with suffixes are not supported`);
          }
          invariant(context.paths);
          return path.join(context.paths.absoluteBasePath, prefix);
        })
        .filter((elem) => elem !== undefined);

      const matchingAbsolutePrefix = absolutePathPrefixesToTry.find((absolutePrefix) => {
        invariant(context.paths);
        return resolvedModule.resolvedFileName.startsWith(absolutePrefix);
      });
      invariant(matchingAbsolutePrefix);

      const origModuleNameWithoutPattern = origModuleName.slice(matchedPathsPattern.prefix.length);

      const resolvedModuleName = resolvedModule.resolvedFileName.slice(
        matchingAbsolutePrefix.length,
      );

      const slugToAdd = resolvedModuleName.slice(origModuleNameWithoutPattern.length);

      newModuleName = `${matchedPathsPattern.prefix}${origModuleNameWithoutPattern}${slugToAdd}`;
    }
  }

  if (newModuleName === undefined) {
    invariant(origModuleName.startsWith('/') || origModuleName.startsWith('.'));
    const absolutePath = origModuleName.startsWith('/')
      ? origModuleName
      : path.join(context.sourceFile.fileName, origModuleName);
    const slugToAdd = resolvedModule.resolvedFileName.slice(absolutePath.length);
    newModuleName = `${origModuleName}${slugToAdd}`;
  }

  return { newModuleName };
}
