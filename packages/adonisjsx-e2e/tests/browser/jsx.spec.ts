import { test } from '@japa/runner'

test.group('JSX', () => {
  test('render basic jsx', async ({ visit }) => {
    const page = await visit('/jsx')
    await page.assertTextContains('body', 'JSX works')
  })

  test('stream jsx with delay', async ({ visit }) => {
    const page = await visit('/suspense', {
      waitUntil: 'commit',
    })
    await page.assertTextContains('body', 'Suspense loading')
    await page.waitForEvent('domcontentloaded')
    await page.assertTextContains('body', 'Suspense works')
  })

  test('fallback to element with jsx errors', async ({ visit }) => {
    const page = await visit('/suspense-error', {
      waitUntil: 'commit',
    })
    await page.assertTextContains('body', 'Suspense loading')
    await page.waitForEvent('domcontentloaded')
    await page.assertTextContains('body', 'Suspense error works')
  })
})
