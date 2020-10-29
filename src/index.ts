import glob from 'glob';
import compareFunc from 'compare-func';

function assertsHasValue<T>(
  value: T,
  errorMessage: string,
): asserts value is Exclude<T, null | undefined | void> {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
}

function globSync(
  patterns: string | string[],
  ignorePatterns: string[],
): string[] {
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  return patterns.reduce(
    (acc, pattern) =>
      acc.concat(glob.sync(pattern, { nodir: true, ignore: ignorePatterns })),
    [] as string[],
  );
}

type Slug = {
  name: string;
  isRest: boolean;
};
type Slugs = Slug[];

type MetaData = {
  component: string;
  urlPath: string;
  path: string;
  slugs?: Slugs;
};

function getRestSlug(metaData: MetaData) {
  return metaData.slugs && metaData.slugs.find((slug) => slug.isRest === true);
}

function genRouteMetaData(componentPath: string, prefetch: boolean): MetaData {
  const urlPath = componentPath
    // 拡張子を取り除く
    .replace(/^(.*)\.(js|jsx|ts|tsx)$/, '$1')
    // /index を消す
    .replace(/^(.*)\/index$/, '$1')
    // 先頭の@/pagesを取り除く
    .replace(/^@\/pages(.*)$/, '$1');
  return _calcRouteMetaData({
    path: urlPath,
    component: `() => import(${
      prefetch ? '/* webpackPrefetch: true */' : ''
    } '${componentPath}')`
      // 拡張子を取り除く
      .replace(/^(.*)\.(js|jsx|ts|tsx)$/, '$1'),
    urlPath: urlPath === '' ? '/' : urlPath,
  });
}

// hoge/fuga/[piyo]/[piyopiyo] => hoge/fuga/:piyo/:piyopiyo
function _calcRouteMetaData(metaData: MetaData): MetaData {
  const result = /^(.*)\[(.*?)\](.*)$/.exec(metaData.urlPath);
  if (!result) {
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
    component: metaData.component,
    path: metaData.path,
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

function route2RouteConfig(route: MetaData, wrap: string) {
  return `
  ['${route.urlPath}']: ${wrap.replace('$1', route.component)}
`;
}

function route2RouteComponent(route: MetaData) {
  return `
<Route path='${route.urlPath}' component={RouteConfig["${route.urlPath}"]} exact />
`;
}

type GenCodeInput = Partial<{
  sourceHead: string;
  wrap: string;
  targetDir: string;
  ignorePatterns: string[];
  prefetch: boolean;
}>;
export function generate(params: GenCodeInput) {
  const {
    sourceHead = "import React from 'react'; import { Route } from 'react-router'; import loadable from '@loadable/component';",
    wrap = 'loadable($1)',
    targetDir = 'src/pages',
    ignorePatterns = [],
    prefetch = false,
  } = params;

  const routes = globSync(`${targetDir}/**/*`, ignorePatterns)
    .map((filePath) => {
      const result = /^src\/(.*)$/.exec(filePath);
      assertsHasValue(result, "There can't be an error here.");
      return `@/${result[1]}`;
    })
    .map((componentPath) => genRouteMetaData(componentPath, prefetch))
    .sort(compareFunc('urlPath'))
    .reverse();

  const typeCode = `export type UseParamsType = {
    ${routes
      .filter((route) => route.slugs)
      .map(
        (route) =>
          `['${route.path}']: { ${(route.slugs as Slugs)
            .map((slug) => `['${slug.name}']: string`)
            .join(';')} }`,
      )
      .join(';')}
  }`;

  const routesCode = `
  ${sourceHead}

  ${typeCode}

  export const RouteConfig = {
    ${routes.map((route) => route2RouteConfig(route, wrap))}
  }

  export default () => (
    <>
      ${routes.map((route) => route2RouteComponent(route)).join('')}
    </>
  )
  `;

  return {
    routesCode,
  };
}
