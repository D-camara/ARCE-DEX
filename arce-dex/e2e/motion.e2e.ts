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

  test('favoritar: botão anuncia o estado e o coração volta ao tamanho normal', async ({ app }) => {
    await openApp(app)
    const heart = app.getByRole('button', { name: 'Favoritar' })
    await expect(heart).toHaveAttribute('aria-pressed', 'false')
    await heart.click()
    await expect(heart).toHaveAttribute('aria-pressed', 'true')
    // Pop finished: the icon wrapper is back to scale 1.
    const scaleOf = () => heart.locator('span.inline-flex').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)
    await expect.poll(scaleOf).toBe(1)
    // Clicking again mid-animation still ends unfavorited and at rest.
    await heart.click()
    await heart.click()
    await heart.click()
    await expect(heart).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(scaleOf).toBe(1)
  })

  test('remover favorito no drawer: item sai e o foco vai para o próximo', async ({ app }) => {
    await openApp(app)
    for (const name of ['garchomp', 'gible', 'riolu']) {
      await app.goto(`/?pokemon=${name}`)
      await app.getByRole('button', { name: 'Favoritar' }).click()
    }
    await app.locator('header').first().getByRole('button', { name: /favoritos/i }).click()
    const drawer = app.getByRole('dialog', { name: 'Pokémon salvos' })
    const cards = drawer.locator('article')
    await expect(cards).toHaveCount(3)
    const first = cards.first()
    const firstName = await first.locator('strong').textContent()
    const secondName = await cards.nth(1).locator('strong').textContent()
    await first.getByRole('button', { name: /^Remover/ }).focus()
    await app.keyboard.press('Enter')
    await expect(cards).toHaveCount(2)
    await expect(drawer.getByText(firstName!)).toHaveCount(0)
    await expect(drawer.getByRole('button', { name: `Remover ${secondName} dos favoritos`, exact: true })).toBeFocused()
  })
})
