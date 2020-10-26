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

type Slugs = string[];

type MetaData = {
  component: string;
  path: string;
  slugs?: Slugs;
};

function genRouteMetaData(componentPath: string): MetaData {
  const path = componentPath
    // 拡張子を取り除く
    .replace(/^(.*)\.(js|jsx|ts|tsx)$/, '$1')
    // /index を消す
    .replace(/^(.*)\/index$/, '$1')
    // 先頭の@/pagesを取り除く
    .replace(/^@\/pages(.*)$/, '$1');
  return _calcRouteMetaData({
    component: `() => import(\`${componentPath}\`)`
      // 拡張子を取り除く
      .replace(/^(.*)\.(js|jsx|ts|tsx)$/, '$1'),
    path: path === '' ? '/' : path,
  });
}

// hoge/fuga/[piyo]/[piyopiyo] => hoge/fuga/:piyo/:piyopiyo
function _calcRouteMetaData(metaData: MetaData): MetaData {
  const result = /^(.*)\[(.*?)\](.*)$/.exec(metaData.path);
  if (!result) {
    return metaData;
  }
  result.reverse();
  return _calcRouteMetaData({
    component: metaData.component,
    path: `${result[2]}:${result[1]}${result[0]}`,
    slugs: [...(metaData.slugs ?? []), result[1]],
  });
}

function route2RouteConfig(route: MetaData, wrap: string) {
  return `
  ["${route.path}"]: ${wrap.replace('$1', route.component)}
`;
}

function route2RouteComponent(route: MetaData) {
  return `
<Route path="${route.path}" component={RouteConfig["${route.path}"]} exact />
`;
}

type GenCodeInput = Partial<{
  sourceHead: string;
  wrap: string;
  targetDir: string;
  ignorePatterns: string[];
}>;
export function generate(params: GenCodeInput) {
  const {
    sourceHead = "import React from 'react'; import { Route } from 'react-router'; import loadable from '@loadable/component';",
    wrap = 'loadable($1)',
    targetDir = 'src/pages',
    ignorePatterns = [],
  } = params;

  const routes = globSync(`${targetDir}/**/*`, ignorePatterns)
    .map((filePath) => {
      const result = /^src\/(.*)$/.exec(filePath);
      assertsHasValue(result, "There can't be an error here.");
      return `@/${result[1]}`;
    })
    .map((componentPath) => genRouteMetaData(componentPath))
    .sort(compareFunc('path'))
    .reverse();

  const typeCode = `export type RouteSlugMap = {
    ${routes
      .filter((route) => route.slugs)
      .map(
        (route) =>
          `[\`${route.path}\`]: { ${(route.slugs as Slugs)
            .map((slugName) => `[\`${slugName}\`]: string`)
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
