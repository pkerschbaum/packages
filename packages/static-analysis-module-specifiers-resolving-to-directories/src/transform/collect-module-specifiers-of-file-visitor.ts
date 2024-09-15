/* eslint-disable unicorn/no-array-method-this-argument -- false positives for `jscodeshift` `find` method */
import jscodeshift from 'jscodeshift';

export function collectModuleSpecifiersOfFileVisitor(opts: { text: string }): string[] {
  const root = jscodeshift.withParser('tsx')(opts.text);
  const astNodesWithModuleSpecifiers = [
    /**
     * @example
     * ```typescript
     * import defaultExport from '#pkg/some-module.js';
     * import * as name from '#pkg/some-module.js'
     * import { noop } from '#pkg/some-module.js';
     * ```
     */
    root.find(jscodeshift.ImportDeclaration, {
      source: {
        type: 'StringLiteral',
      },
    }),

    /**
     * @example
     * ```typescript
     * export * from '#pkg/some-module.js';
     * ```
     */
    root.find(jscodeshift.ExportAllDeclaration, {
      source: {
        type: 'StringLiteral',
      },
    }),

    /**
     * @example
     * ```typescript
     * export { noop } from '#pkg/some-module.js';
     * ```
     */
    root.find(jscodeshift.ExportNamedDeclaration, {
      source: {
        type: 'StringLiteral',
      },
    }),

    /**
     * @example
     * ```typescript
     * await import('#pkg/some-module.js');
     * typeof import('#pkg/some-module.js');
     * ```
     */
    root.find(jscodeshift.ImportExpression, {
      source: {
        type: 'StringLiteral',
      },
    }),
    root.find(jscodeshift.CallExpression, {
      callee: {
        type: 'Import',
      },
    }),

    /**
     * @example
     * ```typescript
     * require('#pkg/some-module.js');
     * ```
     */
    root.find(jscodeshift.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'require',
      },
    }),

    /**
     * @example
     * ```typescript
     * import foo = require('#pkg/some-module.js');
     * ```
     */
    root.find(jscodeshift.TSExternalModuleReference, {
      expression: {
        type: 'StringLiteral',
      },
    }),

    /**
     * @example
     * ```typescript
     * type Type = import('#pkg/some-module.js').Type;
     * ```
     */
    root.find(jscodeshift.TSImportType, {
      argument: {
        type: 'StringLiteral',
      },
    }),

    /**
     * @example
     * ```typescript
     * declare module '#pkg/some-module.js' { }
     * ```
     */
    root.find(jscodeshift.TSModuleDeclaration, {
      id: {
        type: 'StringLiteral',
      },
    }),
  ];

  const collectedModuleSpecifiers: string[] = [];
  for (const astNodes of astNodesWithModuleSpecifiers) {
    collectedModuleSpecifiers.push(...collectModuleSpecifiersOfASTNodes({ ...opts, astNodes }));
  }

  return collectedModuleSpecifiers;
}

function collectModuleSpecifiersOfASTNodes(opts: { astNodes: jscodeshift.Collection }) {
  const collectedModuleSpecifiers: string[] = [];

  opts.astNodes
    .find(jscodeshift.StringLiteral)
    // eslint-disable-next-line unicorn/no-array-for-each -- false positive
    .forEach((path) => {
      // resolve new module specifier and replace it
      const originalModuleSpecifier = path.node.value;
      collectedModuleSpecifiers.push(originalModuleSpecifier);
    });

  return collectedModuleSpecifiers;
}
