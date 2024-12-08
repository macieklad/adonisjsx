import { Suspense } from 'adonisjsx'
import { setTimeout } from 'node:timers/promises'

export function SuspenseTest({ rid }: { rid: string }) {
  return (
    <Suspense
      rid={rid}
      fallback={<div id={'wrapper'}>Suspense loading</div>}
      catch={(err) => <div>Error: {err.stack}</div>}
    >
      <AsyncComponent />
    </Suspense>
  )
}

export function SuspenseErrorTest({ rid }: { rid: string }) {
  return (
    <Suspense
      rid={rid}
      fallback={<div>Suspense loading</div>}
      catch={() => <div>Suspense error works</div>}
    >
      <AsyncErrorComponent />
    </Suspense>
  )
}

async function AsyncComponent() {
  const data = await setTimeout(1000, 'Suspense works')
  return <div>{data}</div>
}

async function AsyncErrorComponent() {
  await setTimeout(1000)
  throw new Error('Suspense error')
}
