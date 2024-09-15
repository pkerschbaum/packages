import ts from 'typescript';

import { VisitorContext } from '#pkg/types';
import { resolvePathAndUpdateNode } from '#pkg/utils/resolve-path-update-node';

export function createNodeVisitor(visitorContext: VisitorContext) {
  /** Visit and replace nodes with module specifiers */
  return function nodeVisitor(node: ts.Node): ts.Node | undefined {
    /**
     * Update require / import functions
     * @example
     *   require("module");
     *   import("module");
     */
    if (isRequire(visitorContext, node) || isAsyncImport(visitorContext, node)) {
      return resolvePathAndUpdateNode(
        visitorContext,
        node,
        (node.arguments[0] as ts.StringLiteral).text,
        (p) => {
          const res = ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
            p,
          ]);

          /* Handle comments */
          const textNode = node.arguments[0];
          if (!textNode) {
            throw new Error('Expected textNode');
          }
          const commentRanges = ts.getLeadingCommentRanges(textNode.getFullText(), 0) ?? [];

          for (const range of commentRanges) {
            const { kind, pos, end, hasTrailingNewLine } = range;

            const caption = textNode
              .getFullText()
              .substring(pos, end)
              .replace(
                /* searchValue */ kind === ts.SyntaxKind.MultiLineCommentTrivia
                  ? // Comment range in a multi-line comment with more than one line erroneously
                    /*
                     * includes the node's text in the range. For that reason, we use the greedy
                     * selector in capture group and dismiss anything after the final comment close tag
                     */
                    /^\/\*(.+)\*\/.*/s
                  : /^\/\/(.+)/s,
                /* replaceValue */ '$1',
              );
            ts.addSyntheticLeadingComment(p, kind, caption, hasTrailingNewLine);
          }

          return res;
        },
      );
    }

    /**
     * Update ExternalModuleReference
     * @example
     *   import foo = require("foo");
     */
    if (ts.isExternalModuleReference(node) && ts.isStringLiteral(node.expression)) {
      return resolvePathAndUpdateNode(visitorContext, node, node.expression.text, (p) =>
        ts.factory.updateExternalModuleReference(node, p),
      );
    }

    /**
     * Update ImportTypeNode
     * @example
     *   typeof import("./bar");
     *   import("package").MyType;
     */
    if (ts.isImportTypeNode(node)) {
      const argument = node.argument as ts.LiteralTypeNode;
      if (!ts.isStringLiteral(argument.literal)) {
        return node;
      }

      const { text } = argument.literal;
      if (!text) {
        return node;
      }

      const res = resolvePathAndUpdateNode(visitorContext, node, text, (p) =>
        ts.factory.updateImportTypeNode(
          node,
          ts.factory.updateLiteralTypeNode(argument, p),
          node.attributes,
          node.qualifier,
          node.typeArguments,
          node.isTypeOf,
        ),
      );

      return ts.visitEachChild(res, nodeVisitor, undefined);
    }

    /**
     * Update ImportDeclaration
     * @example
     *   import ... 'module';
     */
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      return resolvePathAndUpdateNode(visitorContext, node, node.moduleSpecifier.text, (p) => {
        return ts.factory.updateImportDeclaration(
          node,
          node.modifiers,
          node.importClause,
          p,
          node.attributes,
        );
      });
    }

    /**
     * Update ExportDeclaration
     * @example
     *   export ... 'module';
     */
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      return resolvePathAndUpdateNode(visitorContext, node, node.moduleSpecifier.text, (p) => {
        return ts.factory.updateExportDeclaration(
          node,
          node.modifiers,
          node.isTypeOnly,
          node.exportClause,
          p,
          node.attributes,
        );
      });
    }

    /** Update module augmentation */
    if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) {
      return resolvePathAndUpdateNode(visitorContext, node, node.name.text, (p) =>
        ts.factory.updateModuleDeclaration(node, node.modifiers, p, node.body),
      );
    }

    return ts.visitEachChild(node, nodeVisitor, undefined);
  };
}

function isAsyncImport({}: VisitorContext, node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ImportKeyword &&
    !!node.arguments[0] &&
    ts.isStringLiteral(node.arguments[0]) &&
    node.arguments.length === 1
  );
}

function isRequire({}: VisitorContext, node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'require' &&
    !!node.arguments[0] &&
    ts.isStringLiteral(node.arguments[0]) &&
    node.arguments.length === 1
  );
}
