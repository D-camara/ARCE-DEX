import { expect, openApp, test } from './fixtures/fakePokeApi'
import { sampleOverflow, type OverflowWindow } from './fixtures/motion'

// The rest of the e2e suite runs with reduced motion (deterministic end states). This file
// turns animations ON to check what only shows up while they run: horizontal overflow
// mid-animation, interrupted animations leaving the wrong state, final states arriving.
test.use({ reducedMotion: 'no-preference' })

test.describe('animações ligadas', () => {
  test('carregar o app não cria rolagem lateral no meio das animações', async ({ app }) => {
    await app.addInitScript(sampleOverflow, 2000)
    await openApp(app)
    await app.waitForTimeout(800)
    expect(await app.evaluate(() => (window as OverflowWindow).__worstOverflow)).toBeLessThanOrEqual(0)
  })
})
