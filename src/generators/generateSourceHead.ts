import { factory } from 'typescript';

export function generateSourceHead() {
  return [
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        factory.createIdentifier('React'),
        undefined,
      ),
      factory.createStringLiteral('react'),
    ),
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            undefined,
            factory.createIdentifier('Route'),
          ),
        ]),
      ),
      factory.createStringLiteral('react-router'),
    ),
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        factory.createIdentifier('loadable'),
        undefined,
      ),
      factory.createStringLiteral('@loadable/component'),
    ),
  ];
}
