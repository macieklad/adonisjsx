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
- Vite integration
- Uses `@kitajs/html` for JSX runtime

## First steps

```bash
# Install the package
npm i adonisjsx
# Register providers and config
node ace configure adonisjsx
```
### Add jsx factories

After installing package, extend your `tsconfig.json` compiler options:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html",
    // Optionally add the ts-html-plugin for xss protection
    // the package is installed automatically if you are using adonisjsx
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

### Update `useAsyncLocalStorage`
You should also update your `app.ts` `
useAsyncLocalStorage` to `true` if you want to access helpers that depend on `HttpContext` to work.


### Use it!

```tsx
const Component() {
  return <div>Hello World</div>
}

router.get('/', async ({ jsx }) => {
  return jsx.render(Component)
})

router.get('/stream', async ({ jsx }) => {
  jsx.stream(Component)
})
```

## API

With the JSX configured, whenever you use it will be compiled to string, so you can simply return JSX from your routes, controllers, or any other place in your app. However, it may get tedious if you are accustomed to using layouts or you want to use more powerful features like streaming. The package gives you a few tools to make your life easier.

### `HttpContext.jsx.render`
```tsx
render: <
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

### `HttpContext.jsx.stream`
```tsx
stream: <TData extends Record<string, unknown>, TOptions extends {
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

But you may want to show most of your UI instantly, and then stream only the parts that require async data. You can do that with `render` method. It will render the component and then stream the async parts as they resolve. Underneath, this method uses AdonisJS streaming, so you do not return the result of the method, you just call it.

`stream` takes the same options as `render` method, but also accepts `errorCallback` option, which is called when an error occurs during streaming. By default, it will log the error and send 500 status code, but you can override it to handle errors in your own way. It comes directly from the framework [streaming methods](https://docs.adonisjs.com/guides/response#streaming-content). The method will also pass the render id to your component - through `rid` prop that you can pass to the `Suspense` component as unique identifier. If you want to, feel free to generate one yourself.

```tsx
import { Suspense } from 'adonisjsx'

router.get('/', async ({ jsx }) => {
  jsx.stream(MyComponent, { errorCallback: (error) => ([`Rendering failed: ${error.message}`, 500]) })
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

### `viteAssets`
```tsx
async function viteAssets(entries: string[], attributes: Record<string, unknown> = {}): JSX.Element
```
If you use vite with AdonisJS, there are helper methods for edge templates that integrate your templates with vite. `adonisjsx` provides similar helpers for JSX. 

You can use `viteAssets` method to generate resource tags in your JSX that refer to the vite entries.

For vite config like this:
```tsx
adonisjs({
  entrypoints: ['resources/js/app.js'],
})
```

You can add the javascript entry to your JSX like this:
```tsx
import { viteAssets } from 'adonisjsx'

function MyComponent() {
  return (
    <html>
      <head>
        {viteAssets(['resources/js/app.js'])}
      </head>
      <body>
        <div>Hello World</div>
      </body>
    </html>
  )
}
```
### `viteReactRefresh`

```tsx
async function viteReactRefresh(): JSX.Element
```

This function will add the necessary script tags to enable vite's react refresh feature. Make sure it is registered before actual react scripts.

```tsx
import { viteReactRefresh, viteAssets } from 'adonisjsx'

function MyComponent() {
  return (
    <html>
      <head>
        {viteReactRefresh()}
        {viteAssets(['resources/js/app.js'])}
      </head>
      <body>
        <div>Hello World</div>
      </body>
    </html>
  )
}
```

### `csrfField`
With `@adonisjs/shield` installed, you can use `csrfField` method to generate a hidden input with csrf token.

```tsx
import { csrfField } from 'adonisjsx'

function Form() {
  return (
    <form>
      {csrfField()}
      <button>Submit</button>
    </form>
  )
}
```

### `route`
You can use `route` method to generate urls for your routes. It works the same way as in edge templates.

```tsx
// routes.tsx
import router from "@adonisjs/core/services/router";

router.get('/foo', async () => {
  return "foo"
}).as('foo')
```

```tsx

// MyComponent.tsx
import {route} from 'adonisjsx'

function MyComponent() {
  return (
    <a href={route('foo')}>Home</a>
  )
}
```

## Recipes
Code samples that will help you move from `edge` templating.

### Get http context inside the component
You may need to access request or other `HttpContext` metadata inside your component. You can do that by calling `HttpContext.getOrFail` method.

```tsx
function MyComponent() {
  const { request } = HttpContext.getOrFail()
  return <div>{request.ip()}</div>
}
```


## License
Adonisjsx is open-sourced software licensed under the [MIT license](LICENSE.md).

