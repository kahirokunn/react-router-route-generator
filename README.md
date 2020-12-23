# react-router-route-generator

## Install

```
$ npm install -D react-router-route-generator
```

```
$ yarn add -D react-router-route-generator
```

## Examples of useage of generated files

```tsx
import React from 'react';
import { Route } from 'react-router';
import loadable from '@loadable/component';

export type UseParamsType = {
  ['/users/[userId]']: { ['userId']: string };
};

export const RouteConfig = {
  ['/users/:userId']: loadable(() => import('@/pages/users/[userId]/index.tsx')),
  ['/users']: loadable(() => import('@/pages/users/index.tsx')),
  ['/']: loadable(() => import('@/pages/index.tsx')),
};

export default () => (
  <>
    <Route path="/users/:userId" component={RouteConfig['/users/:userId']} exact />

    <Route path="/users" component={RouteConfig['/users']} exact />

    <Route path="/" component={RouteConfig['/']} exact />
  </>
);
```

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';

import { UseParamsType } from '@/gen/routes';

const SampleUserIdPage = () => {
  const { userId } = useParams<UseParamsType['/users/[userId]']>(); // type safe

  return <div>userId: {userId}</div>;
};

export default SampleUserIdPage;
```

```tsx
import React from 'react';
import { Route, Switch } from 'react-router';

import GeneratedRoutes, { RouteConfig } from '@/gen/routes';

const generatedRoutePaths = Object.keys(RouteConfig);

export const Router = () => (
  <Switch>
    <Route path={generatedRoutePaths}>
      <GeneratedRoutes />
    </Route>
    <Route path="*">
      <p>404 not found</p>
    </Route>
  </Switch>
);
```

## Example

### Basic 1

```
$ npx generate-routes ./src/pages
```

### Basic 2

```
$ npx generate-routes -b ./src/pages -- ./src/pages/users/\[userId\]
```

### Ignore Files By Glob Pattern

```
$ npx generate-routes -i '**/*.spec.*' -i '**/*.stories.*' -- ./src/pages
```

### Separate Generated Files Sample

```package.json
"scripts": {
    "generate:routes": "npm-run-all -p generate:routes:* && npx prettier ./src/gen --write",
    "generate:routes:users": "mkdir -p src/gen/users/[userId] && npx generate-routes -i '**/*.spec.*' -i '**/*.stories.*' -b ./src/pages -- ./src/pages/users/\[userId\] > src/gen/users/\[userId\]/routes.tsx",
    "generate:routes:rest": "mkdir -p src/gen/rest && npx generate-routes -i 'src/pages/{auth0,users/\\[userId\\]/*}/**/*' -i '**/*.spec.*' -i '**/*.stories.*' -b ./src/pages -- ./src/pages > src/gen/rest/routes.tsx",
}
```

```
$ npm run generate:routes
```
