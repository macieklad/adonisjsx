import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

export async function viteAssets(entries: string[], attributes: Record<string, unknown> = {}) {
  const { default: vite } = await import('@adonisjs/vite/services/main')
  const elements = await vite.generateEntryPointsTags(entries, attributes)

  return (
    <>
      {elements.map((element) => (
        <tag of={element.tag} {...element.attributes} />
      ))}
    </>
  )
}

export async function viteReactRefresh() {
  const { default: vite } = await import('@adonisjs/vite/services/main')
  const script = vite.getReactHmrScript()

  if (!script) return null

  return <tag of={script?.tag} {...script.attributes} />
}

export function csrfField() {
  const { request } = HttpContext.getOrFail()
  // @ts-expect-error Shield package is not yet typed
  return <input type="hidden" value={request.csrfToken} name="_csrf" />
}

export function route(...args: Parameters<typeof router.makeUrl>) {
  return router.makeUrl(...args)
}
