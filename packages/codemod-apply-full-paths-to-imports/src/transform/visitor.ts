// taken and adapted from https://github.com/LeDDGroup/typescript-transform-paths/blob/2c96be2ec8dcce5732184743dfbb4f5bb3e7956e/src/visitor.ts
import ts from 'typescript';

import { resolveModuleSpecifierAndUpdateNode } from '#pkg/transform/resolve-module-specifier-and-update-node';
import { VisitorContext } from '#pkg/transform/types';

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
      return resolveModuleSpecifierAndUpdateNode(
        visitorContext,
        node,
        (node.arguments[0] as ts.StringLiteral).text,
        (p) => {
          const res = ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
            p,
          ]);

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
      return resolveModuleSpecifierAndUpdateNode(visitorContext, node, node.expression.text, (p) =>
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

      const res = resolveModuleSpecifierAndUpdateNode(visitorContext, node, text, (p) =>
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
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      return resolveModuleSpecifierAndUpdateNode(
        visitorContext,
        node,
        node.moduleSpecifier.text,
        (p) => {
          return ts.factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            p,
            node.attributes,
          );
        },
      );
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
      return resolveModuleSpecifierAndUpdateNode(
        visitorContext,
        node,
        node.moduleSpecifier.text,
        (p) => {
          return ts.factory.updateExportDeclaration(
            node,
            node.modifiers,
            node.isTypeOnly,
            node.exportClause,
            p,
            node.attributes,
          );
        },
      );
    }

    /** Update module augmentation */
    if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) {
      return resolveModuleSpecifierAndUpdateNode(visitorContext, node, node.name.text, (p) =>
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
