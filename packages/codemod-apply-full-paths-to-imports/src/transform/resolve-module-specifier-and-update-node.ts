import path from 'node:path';
import invariant from 'tiny-invariant';
import ts from 'typescript';

import { VisitorContext } from '#pkg/transform/types';

export function resolveModuleSpecifierAndUpdateNode(
  context: VisitorContext,
  node: ts.Node,
  originalModuleSpecifier: string,
  updaterFn: (newPath: ts.StringLiteral) => ts.Node | undefined,
): ts.Node | undefined {
  let pathsPatternMatched = false;
  if (context.paths) {
    pathsPatternMatched = !!ts.matchPatternOrExact(context.paths.patterns, originalModuleSpecifier);
  }

  // ignore moduleSpecifiers which are not absolute paths, relative paths, or "paths" patterns
  if (
    !isAbsolutePathModuleSpecifier(originalModuleSpecifier) &&
    !isRelativePathModuleSpecifier(originalModuleSpecifier) &&
    !pathsPatternMatched
  ) {
    return node;
  }

  const newModuleSpecifier = mapToExactModuleSpecifier(context, originalModuleSpecifier);
  if (!newModuleSpecifier) {
    return node;
  }

  return updaterFn(ts.factory.createStringLiteral(newModuleSpecifier));
}

function isAbsolutePathModuleSpecifier(moduleSpecifier: string) {
  return moduleSpecifier.startsWith('/');
}

function isRelativePathModuleSpecifier(moduleSpecifier: string) {
  return moduleSpecifier.startsWith('.');
}

export function mapToExactModuleSpecifier(
  context: VisitorContext,
  originalModuleSpecifier: string,
) {
  const { resolvedModule } = ts.resolveModuleName(
    originalModuleSpecifier,
    context.sourceFile.fileName,
    context.compilerOptions,
    ts.sys,
  );

  invariant(resolvedModule, `Could not resolve module: ${originalModuleSpecifier}`);

  let newModuleSpecifier;
  if (context.paths) {
    const matchedPathsPattern = ts.matchPatternOrExact(
      context.paths.patterns,
      originalModuleSpecifier,
    );
    if (
      matchedPathsPattern &&
      // ignore patterns which do not have a star in them and thus, resolve to concrete file(s) anyways
      typeof matchedPathsPattern !== 'string'
    ) {
      if (matchedPathsPattern.suffix !== '') {
        throw new TypeError(`patterns with suffixes are not supported`);
      }
      invariant(context.compilerOptions.paths);
      const pathsDestinationPatterns =
        context.compilerOptions.paths[ts.patternText(matchedPathsPattern)];
      invariant(pathsDestinationPatterns);

      const parsedDestinationPatterns = pathsDestinationPatterns
        .map((pathDestinationPattern) => {
          const parsedPattern = ts.tryParsePattern(pathDestinationPattern);
          if (!parsedPattern) {
            // invalid pattern
            return undefined;
          }
          const prefix = typeof parsedPattern === 'string' ? parsedPattern : parsedPattern.prefix;
          const suffix = typeof parsedPattern === 'string' ? undefined : parsedPattern.suffix;
          invariant(context.paths);
          return {
            fullPrefix: path.join(context.paths.absoluteBasePath, prefix),
            prefix,
            suffix,
          };
        })
        .filter((elem) => elem !== undefined);

      const matchingDestinationPattern = parsedDestinationPatterns.find((destinationPattern) => {
        return resolvedModule.resolvedFileName.startsWith(destinationPattern.fullPrefix);
      });
      invariant(matchingDestinationPattern);

      // e.g. "#pkg/internal/transformer" -> "internal/transformer"
      const origModuleNameWithoutPattern = originalModuleSpecifier.slice(
        matchedPathsPattern.prefix.length,
      );

      // e.g. "/home/user/project/src/internal/transformer.ts" -> "internal/transformer.ts"
      const resolvedModuleName = resolvedModule.resolvedFileName.slice(
        matchingDestinationPattern.fullPrefix.length,
      );

      // e.g. "internal/transformer" and "internal/transformer.ts" --> ".ts"
      const slugToAdd = resolvedModuleName.slice(origModuleNameWithoutPattern.length);

      // e.g. "#pkg/", "internal/transformer", "ts" --> "#pkg/internal/transformer.ts"
      newModuleSpecifier = `${matchedPathsPattern.prefix}${origModuleNameWithoutPattern}${slugToAdd}`;
    }
  }

  if (newModuleSpecifier === undefined) {
    // we have no "paths" patterns at all or none matched --> must be a module specifier which is an absolute or relative path
    invariant(
      isAbsolutePathModuleSpecifier(originalModuleSpecifier) ||
        isRelativePathModuleSpecifier(originalModuleSpecifier),
    );
    const moduleSpecifierAbsolutePath = originalModuleSpecifier.startsWith('/')
      ? originalModuleSpecifier
      : path.join(context.sourceFile.fileName, originalModuleSpecifier);
    const slugToAdd = resolvedModule.resolvedFileName.slice(moduleSpecifierAbsolutePath.length);
    newModuleSpecifier = `${originalModuleSpecifier}${slugToAdd}`;
  }

  const extname = path.extname(newModuleSpecifier);
  const moduleNameWithoutExt = newModuleSpecifier.slice(
    0,
    newModuleSpecifier.length - extname.length,
  );
  // map "ts" to "js", "tsx" to "jsx", "mts" to "mjs", etc.
  const mappedExtname = extname.replace('t', 'j');

  const finalNewModuleName = `${moduleNameWithoutExt}${mappedExtname}`;

  return finalNewModuleName;
}
