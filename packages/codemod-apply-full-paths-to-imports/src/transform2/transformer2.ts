import jscodeshift from 'jscodeshift';
import invariant from 'tiny-invariant';

import { type ModuleSpecifierMap } from '#pkg/transform/transformer';

type QuoteToUseRef = {
  value: NonNullable<Parameters<jscodeshift.Collection['toSource']>[0]>['quote'];
};

export function transformer2(
  input: Array<{ text: string; moduleSpecifierMap: ModuleSpecifierMap }>,
) {
  return input.map((entry) => {
    // https://github.com/benjamn/recast/issues/171#issuecomment-224996336
    const quoteToUseRef: QuoteToUseRef = { value: undefined };

    const root = jscodeshift.withParser('tsx')(entry.text);
    for (const [origModuleSpecifier, newModuleSpecifier] of entry.moduleSpecifierMap) {
      const collectionsToRewrite = [
        /**
         * @example
         * ```typescript
         * import defaultExport from '#pkg/some-module.js';
         * import * as name from '#pkg/some-module.js'
         * import { noop } from '#pkg/some-module.js';
         * ```
         */
        root.find(jscodeshift.ImportDeclaration),

        /**
         * @example
         * ```typescript
         * export * from '#pkg/some-module.js';
         * ```
         */
        root.find(jscodeshift.ExportAllDeclaration),

        /**
         * @example
         * ```typescript
         * export { noop } from '#pkg/some-module.js';
         * ```
         */
        root.find(jscodeshift.ExportNamedDeclaration),

        /**
         * @example
         * ```typescript
         * await import('#pkg/some-module.js');
         * typeof import('#pkg/some-module.js');
         * ```
         */
        root.find(jscodeshift.ImportExpression),
        root.find(
          jscodeshift.CallExpression,
          // eslint-disable-next-line unicorn/no-array-method-this-argument -- false positive
          {
            callee: {
              type: 'Import',
            },
          },
        ),

        /**
         * @example
         * ```typescript
         * require('#pkg/some-module.js');
         * ```
         */
        root.find(
          jscodeshift.CallExpression,
          // eslint-disable-next-line unicorn/no-array-method-this-argument -- false positive
          {
            callee: {
              type: 'Identifier',
              name: 'require',
            },
          },
        ),

        /**
         * @example
         * ```typescript
         * import foo = require('#pkg/some-module.js');
         * ```
         */
        root.find(jscodeshift.TSExternalModuleReference),

        /**
         * @example
         * ```typescript
         * type Type = import('#pkg/some-module.js').Type;
         * ```
         */
        root.find(jscodeshift.TSImportType),

        /**
         * @example
         * ```typescript
         * declare module '#pkg/some-module.js' { }
         * ```
         */
        root.find(jscodeshift.TSModuleDeclaration),
      ];
      for (const collection of collectionsToRewrite) {
        rewriteModuleSpecifier(collection, origModuleSpecifier, newModuleSpecifier, quoteToUseRef);
      }
    }

    return root.toSource({ quote: quoteToUseRef.value });
  });
}

function rewriteModuleSpecifier(
  collection: jscodeshift.Collection,
  origModuleSpecifier: string,
  newModuleSpecifier: string,
  quoteToUseRef: QuoteToUseRef,
) {
  return (
    collection
      .find(
        jscodeshift.Literal,
        // eslint-disable-next-line unicorn/no-array-method-this-argument -- false positive
        { value: origModuleSpecifier },
      )
      // eslint-disable-next-line unicorn/no-array-for-each -- false positive
      .forEach((path) => {
        invariant(
          'extra' in path.node &&
            typeof path.node.extra === 'object' &&
            path.node.extra !== null &&
            'raw' in path.node.extra &&
            typeof path.node.extra.raw === 'string' &&
            (path.node.extra.raw.startsWith('"') || path.node.extra.raw.startsWith("'")),
        );
        if (path.node.extra.raw.startsWith("'")) {
          quoteToUseRef.value = 'single';
        } else if (path.node.extra.raw.startsWith('"')) {
          quoteToUseRef.value = 'double';
        }

        path.node.value = newModuleSpecifier;
      })
  );
}
