import { renderToStream } from '@kitajs/html/suspense.js'
import { Component } from '@kitajs/html'
import { ApplicationService } from '@adonisjs/core/types'
import { HttpContext } from '@adonisjs/core/http'
import Element = JSX.Element

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    jsx: <
      TData extends Record<string, unknown>,
      TOptions extends {
        layout?: Component
        data: TData
      },
    >(
      view: Component<TData> | Element | string,
      options?: TOptions
    ) => Promise<JSX.Element>
    streamJsx: <
      TData extends Record<string, unknown>,
      TOptions extends {
        layout?: Component
        errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
        data: TData
      },
    >(
      view: Component<TData & { rid?: number | string }>,
      options?: TOptions
    ) => void
  }
}

export default class JsxProvider {
  constructor(protected app: ApplicationService) {}
  async boot() {
    const app = this.app
    HttpContext.macro('jsx', async function (view, options) {
      const layout = options?.layout ?? app.config.get('jsx.defaultLayout')
      if (layout) {
        if (typeof view === 'string' || view instanceof Promise) {
          return layout({ ...options?.data, children: view })
        }

        return layout({ ...options?.data, children: view(options?.data!) })
      }

      if (typeof view === 'string' || view instanceof Promise) {
        return view
      }

      return view(options?.data!)
    })

    HttpContext.macro('streamJsx', function (view, options) {
      const layout = options?.layout ?? app.config.get('jsx.defaultLayout')
      const ctx = HttpContext.getOrFail()

      function markup(rid: number | string) {
        if (layout) {
          return layout({ ...options?.data, children: view({ ...options?.data!, rid }) })
        }

        return view({
          ...options?.data!,
          rid,
        })
      }

      ctx.response.header('Content-Type', 'text/html')
      ctx.response.stream(renderToStream(markup), options?.errorCallback)
    })
  }
}
