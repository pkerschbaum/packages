import ts from 'typescript';

import { VisitorContext } from '#pkg/types';
import { resolvePathAndUpdateNode } from '#pkg/utils';

const isAsyncImport = ({}: VisitorContext, node: ts.Node): node is ts.CallExpression =>
  ts.isCallExpression(node) &&
  node.expression.kind === ts.SyntaxKind.ImportKeyword &&
  !!node.arguments[0] &&
  ts.isStringLiteral(node.arguments[0]) &&
  node.arguments.length === 1;

const isRequire = ({}: VisitorContext, node: ts.Node): node is ts.CallExpression =>
  ts.isCallExpression(node) &&
  ts.isIdentifier(node.expression) &&
  node.expression.text === 'require' &&
  !!node.arguments[0] &&
  ts.isStringLiteral(node.arguments[0]) &&
  node.arguments.length === 1;

/** Visit and replace nodes with module specifiers */
export function nodeVisitor(this: VisitorContext, node: ts.Node): ts.Node | undefined {
  const { transformationContext } = this;

  /**
   * Update require / import functions
   * @example
   *   require("module");
   *   import("module");
   */
  if (isRequire(this, node) || isAsyncImport(this, node)) {
    return resolvePathAndUpdateNode(
      this,
      node,
      (node.arguments[0] as ts.StringLiteral).text,
      (p) => {
        const res = ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [p]);

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
    return resolvePathAndUpdateNode(this, node, node.expression.text, (p) =>
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

    const res = resolvePathAndUpdateNode(this, node, text, (p) =>
      ts.factory.updateImportTypeNode(
        node,
        ts.factory.updateLiteralTypeNode(argument, p),
        node.attributes,
        node.qualifier,
        node.typeArguments,
        node.isTypeOf,
      ),
    );

    return ts.visitEachChild(res, this.getVisitor(), transformationContext);
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
    return resolvePathAndUpdateNode(this, node, node.moduleSpecifier.text, (p) => {
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
    return resolvePathAndUpdateNode(this, node, node.moduleSpecifier.text, (p) => {
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
    return resolvePathAndUpdateNode(this, node, node.name.text, (p) =>
      ts.factory.updateModuleDeclaration(node, node.modifiers, p, node.body),
    );
  }

  return ts.visitEachChild(node, this.getVisitor(), transformationContext);
}
