import compareFunc from 'compare-func';
import { MetaData } from './type';
import { assertsHasValue, escapeFilePath, globSync } from './utils';
import * as ts from 'typescript';
import { factory } from 'typescript';
import { generateRouteConfig } from './generators/generateRouteConfig';
import { generateRoutes } from './generators/generateRoutes';
import { generateSourceHead } from './generators/generateSourceHead';
import { generateTypeCode } from './generators/generateTypeCode';

// 拡張子を取り除く
// .replace(/^(.*)\.(js|jsx|ts|tsx)$/, '$1')
function genRouteMetaData(componentPath: string): MetaData {
  let urlPath = componentPath
    // 末尾の/index.{js,jsx,ts,tsx} を消す
    .replace(/^(.*)\/index\.(js|jsx|ts|tsx)$/, '$1');

  const isLastOptional = /^(.*)\.(js|jsx|ts|tsx)$/.test(urlPath);
  if (isLastOptional) {
    urlPath = urlPath.replace(/^(.*)\.(js|jsx|ts|tsx)$/, '$1');
  }
  return _calcRouteMetaData({
    path: urlPath,
    isLastOptional,
    componentPath: componentPath.replace(/^(.*)\.(js|jsx|ts|tsx)$/, '$1'),
    urlPath: urlPath === '' ? '/' : urlPath,
  });
}

// hoge/fuga/[piyo]/[piyopiyo] => hoge/fuga/:piyo/:piyopiyo
function _calcRouteMetaData(metaData: MetaData): MetaData {
  const result = /^(.*)\[(.*?)\](.*)$/.exec(metaData.urlPath);
  if (!result) {
    if (metaData.isLastOptional) {
      const items = metaData.urlPath.split('/');
      items[items.length - 1] = `${items[items.length - 1]}?`;
      metaData = {
        ...metaData,
        urlPath: items.join('/'),
      };
    }
    return metaData;
  }
  result.reverse();
  let isRest = false;

  const slug = /^\.\.\.(.*)$/.exec(result[1]);
  if (slug) {
    isRest = true;
    result[1] = slug[1];
  }

  return _calcRouteMetaData({
    ...metaData,
    urlPath: isRest
      ? `${result[2]}:${result[1]}(.*)`
      : `${result[2]}:${result[1]}${result[0]}`,
    slugs: [
      ...(metaData.slugs ?? []),
      {
        name: result[1],
        isRest,
      },
    ],
  });
}

type GenCodeInput = {
  targetDir: string;
  baseDir: string;
  importPrefix: string;
  ignorePatterns?: string[];
};
export function generate(params: GenCodeInput) {
  const { targetDir, baseDir, importPrefix, ignorePatterns = [] } = params;

  const routes = globSync(`${escapeFilePath(targetDir)}/**/*`, ignorePatterns)
    .map((filePath) => {
      const result = new RegExp(`^${baseDir}(.*)$`).exec(filePath);
      assertsHasValue(
        result,
        `There can't be an error here. filePath: ${filePath}`,
      );
      return result[1];
    })
    .map((componentPath) => genRouteMetaData(componentPath))
    .sort(compareFunc('urlPath'))
    .reverse();

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  return printer.printNode(
    ts.EmitHint.Unspecified,
    factory.createSourceFile(
      [
        ...generateSourceHead(),
        ...generateTypeCode(routes),
        ...generateRouteConfig(routes, importPrefix),
        ...generateRoutes(routes),
      ],
      factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    ),
    ts.createSourceFile(
      '',
      '',
      ts.ScriptTarget.ESNext,
      false,
      ts.ScriptKind.TSX,
    ),
  );
}
