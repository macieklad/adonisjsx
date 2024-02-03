<div align="center">
  <h1>adonisjsx</h1>
  <p>Integrate JSX as AdonisJS v6 view engine</p>
  <a href="https://www.npmjs.com/package/adonisjsx">
    <img src="https://img.shields.io/npm/v/adonisjsx.svg?style=for-the-badge&logo=npm" />
  </a>
  <img src="https://img.shields.io/npm/l/adonisjsx?color=blueviolet&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript" />
</div>
<br />


## Features

- JSX as a runtime, usable everywhere in your app
- Config for global layouts
- Extended `HTTPContext` with jsx rendering and streaming methods
- Uses `@kitajs/html` for JSX runtime

## First steps

```bash
# Install the package
npm i adonisjsx
# Register providers and config
node ace configure adonisjsx
```

After installing package, extend your `tsconfig.json` compiler options:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Html.createElement",
    "jsxFragmentFactory": "Html.Fragment"
  },
  // Optionally add the ts-html-plugin for xss protection
  // the package is installed automatically if you are using adonisjsx
  "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
}
```

As in `jsxFactory` and `jsxFragmentFactory`, `Html` class must be available in scope whenever you are using JSX. You can import it directly in your files when using JSX:

```tsx
import Html from 'adonisjsx'

router.get('/', async ({ view }) => {
  return <div>Hello World</div>
})
```

Or add it globally by registering `Html` module. Add an import to your `server.ts` at the top of the file:
```tsx
import 'adonisjsx/register'
```

## API

With the JSX configured, whenever you use it will be compiled to string, so you can simply return JSX from your routes, controllers, or any other place in your app. However, it may get tedious if you are accustomed to using layouts or you want to use more powerful features like streaming. The package gives you a few tools to make your life easier.

### `HttpContext.jsx`
```tsx
jsx: <
  TData extends Record<string, unknown>,
  TOptions extends {
    layout?: Component
    data: TData
  },
>(
  view: Component<TData> | string,
  options?: TOptions
) => Promise<JSX.Element>
```
You can render your components with the jsx util. It will wrap your component with global layout by default (which you can override through options or change it globally in the `jsx.ts` config published by the package). 

```tsx
// routes.tsx
import { MyComponent, Layout } from '#components'
route.get('/', async ({ jsx }) => {
  return jsx(MyComponent)
  // If your component takes props, data option will be typed accordingly
  return jsx(MyComponent, { data: { name: 'John' }, layout: Layout })
})
```

### `HttpContext.streamJsx`
```tsx
streamJsx: <TData extends Record<string, unknown>, TOptions extends {
    layout?: Component;
    errorCallback?: (error: NodeJS.ErrnoException) => [string, number?];
    data: TData;
}>(view: Component<TData & {
    rid?: number | string;
}>, options?: TOptions) => void
```

You can `await` any data in the component normally, as they are not react components but just functions that are converted from syntax sugar into pure javascript. 

```tsx 
async function MyComponent() {
  const data = await fetch('https://api.com/data')
  return <div>{data}</div>
}
```

But you may want to show most of your UI instantly, and then stream only the parts that require async data. You can do that with `streamJsx` method. It will render the component and then stream the async parts as they resolve. Underneath, this method uses AdonisJS streaming, so you do not return the result of the method, you just call it.

Stream jsx takes the same options as `jsx` method, but also accepts `errorCallback` option, which is called when an error occurs during streaming. By default, it will log the error and send 500 status code, but you can override it to handle errors in your own way. It comes directly from the framework [streaming methods](https://docs.adonisjs.com/guides/response#streaming-content).

```tsx
import { Suspense } from 'adonisjsx'

router.get('/', async ({ streamJsx }) => {
  streamJsx(MyComponent)
})

function MyComponent({ rid }) {
  return (<>
    <div>Instant UI</div>
    <Suspense
      rid={rid}
      fallback={<div>Loading username...</div>}
      catch={(err) => <div>Error: {err.stack}</div>}
    >
      <MyAsyncComponent />
    </Suspense>
  </>)
}

async function MyAsyncComponent() {
  const data = await fetch('https://api.com/data')
  return <div>{data}</div>
}
```

## Recipes
Code samples that will help you move from `edge` templating.

### Get http context inside the component
You may need to access request or other `HttpContext` metadata inside your component. You can do that by calling `HttpContext.getOrFail` method. You will have to update your `app.ts` `
useAsyncLocalStorage` config for it to work.

```tsx
function MyComponent() {
  const { request } = HttpContext.getOrFail()
  return <div>{request.ip()}</div>
}
```


## License
Adonisjsx is open-sourced software licensed under the [MIT license](LICENSE.md).

