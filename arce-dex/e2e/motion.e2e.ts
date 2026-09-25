import { expect, openApp, test } from './fixtures/fakePokeApi'
import { sampleOverflow, worstOverflowDuring, type OverflowWindow } from './fixtures/motion'

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

  test('indicador de aba desliza e termina dentro da aba ativa, que fica inteira visível', async ({ app }) => {
    await openApp(app)
    const tablist = app.getByRole('tablist', { name: 'Dados do Pokémon' })
    // Last tab: on narrow screens it starts partly hidden in the sideways-scrolling bar.
    const last = app.getByRole('tab', { name: 'Formas' })
    // dispatchEvent, not click(): Playwright's click scrolls the element into view by itself,
    // which would hide a missing scrollIntoView in the app.
    const overflow = await worstOverflowDuring(app, 500, () => last.dispatchEvent('click'))
    expect(overflow).toBeLessThanOrEqual(0)
    await expect(last).toHaveAttribute('aria-selected', 'true')

    const [bar, tab, indicator] = await Promise.all([
      tablist.boundingBox(),
      last.boundingBox(),
      last.locator('span[aria-hidden="true"]').boundingBox(),
    ])
    expect(tab!.x).toBeGreaterThanOrEqual(bar!.x - 1)
    expect(tab!.x + tab!.width).toBeLessThanOrEqual(bar!.x + bar!.width + 1)
    // The layout animation landed: indicator covers the active tab (±border).
    expect(Math.abs(indicator!.x - tab!.x)).toBeLessThanOrEqual(2)
    expect(Math.abs(indicator!.width - tab!.width)).toBeLessThanOrEqual(3)
    await expect(tablist.locator('span[aria-hidden="true"]')).toHaveCount(1)
  })

  test('números dos stats terminam no valor certo, e o Total é a soma', async ({ app }) => {
    await openApp(app)
    const stats = app.getByRole('group', { name: 'Stats base' })
    const rows = stats.locator('[data-stat]')
    await expect(rows).toHaveCount(7)
    // Count-up finished: every visible (aria-hidden) number equals its final value.
    await expect
      .poll(() =>
        rows.evaluateAll((els) =>
          els.every((row) => row.querySelector('[aria-hidden="true"]')?.textContent === row.getAttribute('data-stat')),
        ),
      )
      .toBe(true)
    const values = await rows.evaluateAll((els) => els.map((row) => Number(row.getAttribute('data-stat'))))
    const total = values.pop()
    expect(total).toBe(values.reduce((sum, value) => sum + value, 0))
  })
})
