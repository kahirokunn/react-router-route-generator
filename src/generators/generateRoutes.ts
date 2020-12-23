import type { MetaData } from '../type';
import * as ts from 'typescript';
import { factory } from 'typescript';

export function generateRoutes(routes: MetaData[]) {
  return [
    factory.createExportAssignment(
      undefined,
      undefined,
      undefined,
      factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createParenthesizedExpression(
          factory.createJsxFragment(
            factory.createJsxOpeningFragment(),
            routes.map((route) =>
              factory.createJsxSelfClosingElement(
                factory.createIdentifier('Route'),
                undefined,
                factory.createJsxAttributes([
                  factory.createJsxAttribute(
                    factory.createIdentifier('path'),
                    factory.createStringLiteral(route.urlPath),
                  ),
                  factory.createJsxAttribute(
                    factory.createIdentifier('component'),
                    factory.createJsxExpression(
                      undefined,
                      factory.createElementAccessExpression(
                        factory.createIdentifier('RouteConfig'),
                        factory.createStringLiteral(route.urlPath),
                      ),
                    ),
                  ),
                  factory.createJsxAttribute(
                    factory.createIdentifier('exact'),
                    undefined,
                  ),
                ]),
              ),
            ),
            factory.createJsxJsxClosingFragment(),
          ),
        ),
      ),
    ),
  ];
}
