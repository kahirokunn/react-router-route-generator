import type { MetaData } from '../type';
import * as ts from 'typescript';
import { factory } from 'typescript';

export function generateRouteConfig(routes: MetaData[], importPrefix: string) {
  return [
    factory.createVariableStatement(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier('RouteConfig'),
            undefined,
            undefined,
            factory.createObjectLiteralExpression(
              routes.map((route) =>
                factory.createPropertyAssignment(
                  factory.createComputedPropertyName(
                    factory.createStringLiteral(route.urlPath),
                  ),
                  factory.createCallExpression(
                    factory.createIdentifier('loadable'),
                    undefined,
                    [
                      factory.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        undefined,
                        factory.createToken(
                          ts.SyntaxKind.EqualsGreaterThanToken,
                        ),
                        factory.createCallExpression(
                          factory.createToken(
                            ts.SyntaxKind.ImportKeyword,
                          ) as ts.Expression,
                          undefined,
                          [
                            factory.createStringLiteral(
                              `${importPrefix}${route.componentPath}`,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              true,
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    ),
  ];
}
