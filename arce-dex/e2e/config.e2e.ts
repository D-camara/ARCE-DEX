import { expect, openApp, test } from './fixtures/fakePokeApi'

// Guard: the suite relies on reduced motion for deterministic end states. It once ran with
// animations on for weeks because the option was set in a way Playwright ignores.
test('a suíte roda com reduced motion ligado', async ({ app }) => {
  await openApp(app)
  expect(await app.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
})
