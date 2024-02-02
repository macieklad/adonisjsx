import { HttpContext } from '@adonisjs/core/http'
import { renderToStream } from '@kitajs/html/suspense.js'
import { ApplicationService } from '@adonisjs/core/types'
import { Component } from '@kitajs/html'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    jsx: <
      TData extends Record<string, unknown>,
      TOptions extends {
        layout?: Component
        data: TData
      },
    >(
      view: Component<TData> | string,
      options?: TOptions
    ) => JSX.Element
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

  register() {
    HttpContext.macro('jsx', function (this: JsxProvider, view, options) {
      const layout = options?.layout ?? this.app.config.get('jsx.defaultLayout')

      if (layout) {
        if (typeof view === 'string') {
          return layout({ ...options?.data, children: view })
        }
        return layout({ ...options?.data, children: view(options?.data!) })
      }

      return typeof view === 'string' ? view : view(options?.data!)
    })

    HttpContext.macro('streamJsx', function (this: JsxProvider, view, options) {
      const layout = options?.layout ?? this.app.config.get('jsx.defaultLayout')
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
