import type { MetaData } from '../type';
import * as ts from 'typescript';
import { factory } from 'typescript';

export function generateTypeCode(routes: MetaData[]) {
  const hasSlugsRoutes = routes.filter(
    (route) => route.slugs,
  ) as Required<MetaData>[];
  return [
    factory.createTypeAliasDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier('UseParamsType'),
      undefined,
      factory.createTypeLiteralNode(
        hasSlugsRoutes.map((route) =>
          factory.createPropertySignature(
            undefined,
            factory.createComputedPropertyName(
              factory.createStringLiteral(route.path),
            ),
            undefined,
            factory.createTypeLiteralNode(
              route.slugs.map((slug) =>
                factory.createPropertySignature(
                  undefined,
                  factory.createComputedPropertyName(
                    factory.createStringLiteral(slug.name),
                  ),
                  undefined,
                  factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ];
}
