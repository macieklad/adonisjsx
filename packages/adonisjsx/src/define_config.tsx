import { Component, PropsWithChildren } from '@kitajs/html'
import { defu } from 'defu'

export interface JsxConfig {
  defaultLayout?: Component
}

export function defineConfig(config: JsxConfig): JsxConfig {
  return defu(config, {
    defaultLayout: ({ children }: PropsWithChildren) => {
      return (
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>AdonisJS</title>
          </head>
          <body>{children}</body>
        </html>
      )
    },
  })
}
