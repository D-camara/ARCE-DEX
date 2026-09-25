import { expect, openApp, test, visitPokemon } from './fixtures/fakePokeApi'
import { addToTeam, sampleOverflow, worstOverflowDuring, type OverflowWindow } from './fixtures/motion'

// The rest of the e2e suite runs with reduced motion (deterministic end states). This file
// turns animations ON to check what only shows up while they run: horizontal overflow
// mid-animation, interrupted animations leaving the wrong state, final states arriving.
test.use({ contextOptions: { reducedMotion: 'no-preference' } })

test.describe('animações ligadas', () => {
  test('este arquivo roda mesmo com animação (reduced motion desligado)', async ({ app }) => {
    await openApp(app)
    expect(await app.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false)
  })

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
      await visitPokemon(app, name)
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

  test('trocar Pokédex ↔ Laboratório: foco na tela nova, sem rolagem lateral, e interrompível', async ({ app }) => {
    await openApp(app)
    const overflow = await worstOverflowDuring(app, 600, () =>
      app.getByRole('button', { name: /meu time/i }).click(),
    )
    expect(overflow).toBeLessThanOrEqual(0)
    const lab = app.getByRole('region', { name: 'Laboratório do time' })
    await expect(lab).toBeFocused()
    // At rest the view has no leftover transform (a transform would trap fixed descendants).
    await expect.poll(() => lab.evaluate((el) => getComputedStyle(el).transform)).toBe('none')

    await app.goBack()
    await expect(app.getByRole('region', { name: 'Pokédex' })).toBeFocused()

    // Back and forth faster than the animation: ends on the last requested view.
    await app.getByRole('button', { name: /meu time/i }).click()
    await app.goBack()
    await app.goForward()
    await app.goBack()
    await expect(app).not.toHaveURL(/view=team/)
    await expect(app.getByRole('region', { name: 'Pokédex' })).toBeVisible()
    await expect(app.getByRole('region', { name: 'Laboratório do time' })).toHaveCount(0)
    await expect(app.getByRole('group', { name: 'Stats base' })).toBeVisible()
  })

  test('slots do time: remover anima, foco vai para o slot vazio, limpar e trocar de time no meio', async ({ app }) => {
    await openApp(app)
    await addToTeam(app, ['garchomp', 'gible', 'lucario'])
    await app.getByRole('button', { name: /meu time/i }).click()
    const grid = app.getByRole('region', { name: 'Slots do time' })
    const removeButtons = grid.getByRole('button', { name: 'Remover' })
    await expect(removeButtons).toHaveCount(3)

    const overflow = await worstOverflowDuring(app, 500, () => removeButtons.first().click())
    expect(overflow).toBeLessThanOrEqual(0)
    await expect(removeButtons).toHaveCount(2)
    await expect(grid.getByRole('group', { name: 'Slot 1 vazio' })).toBeFocused()
    await expect(app.getByText('2/6 slots', { exact: false })).toBeVisible()

    // Clear, then switch team while the cards are still leaving: no duplicate or lost slot.
    await app.getByRole('button', { name: 'Limpar' }).click()
    await app.getByRole('button', { name: '2', exact: true }).click()
    await app.getByRole('button', { name: '1', exact: true }).click()
    await expect(removeButtons).toHaveCount(0)
    await expect(grid.getByText('Slot vazio')).toHaveCount(6)
  })

  test('listas fecham o buraco: remover favorito do meio e recente que volta ao topo', async ({ app }) => {
    await openApp(app)
    for (const name of ['garchomp', 'gible', 'gabite', 'riolu']) {
      await visitPokemon(app, name)
      await app.getByRole('button', { name: 'Favoritar' }).click()
    }
    await app.locator('header').first().getByRole('button', { name: /favoritos/i }).click()
    const drawer = app.getByRole('dialog', { name: 'Pokémon salvos' })
    const cards = drawer.locator('article')
    await expect(cards).toHaveCount(4)
    await cards.nth(1).getByRole('button', { name: /^Remover/ }).click()
    await expect(cards).toHaveCount(3)
    // Once the items below have slid up: no overlap, no leftover transform.
    await expect
      .poll(() =>
        cards.evaluateAll((els) =>
          els.every((el, i) => {
            const style = getComputedStyle(el).transform
            const settled = style === 'none' || new DOMMatrix(style).isIdentity
            return settled && (i === 0 || el.getBoundingClientRect().top >= els[i - 1].getBoundingClientRect().bottom)
          }),
        ),
      )
      .toBe(true)
    await app.keyboard.press('Escape')

    // Recentes come from searches. Picking an older one brings it back to the top.
    for (const name of ['garchomp', 'gible', 'riolu']) {
      await app.getByRole('combobox').fill(name)
      await app.getByRole('combobox').press('Enter')
      await expect(app).toHaveTitle(new RegExp(name, 'i'))
    }
    const recents = app.getByRole('heading', { name: 'Recentes' }).locator('xpath=..').getByRole('button')
    await expect(recents.first().locator('strong')).toHaveText('Riolu')
    await recents.filter({ hasText: 'Garchomp' }).click()
    await expect(recents.first().locator('strong')).toHaveText('Garchomp')
    await expect(recents).toHaveCount(3)
  })

  test('análise mostra o que mudou desde a última visita', async ({ app }) => {
    await openApp(app)
    // Three dragon/ground Pokémon: 3 weak to Ice. Removing one leaves the row, now at 2.
    await addToTeam(app, ['garchomp', 'gible', 'gabite'])
    await app.getByRole('button', { name: /meu time/i }).click()
    const analysisTab = app.getByRole('button', { name: 'Análise', exact: true })
    await analysisTab.click()
    // First visit: nothing to compare with.
    await expect(app.getByRole('heading', { name: 'Defesa' })).toBeVisible()
    await expect(app.getByRole('article', { name: 'Mudanças desde a última visita' })).toHaveCount(0)

    await app.getByRole('button', { name: 'Time', exact: true }).click()
    await app.getByRole('region', { name: 'Slots do time' }).getByRole('button', { name: 'Remover' }).first().click()
    await analysisTab.click()

    const changes = app.getByRole('article', { name: 'Mudanças desde a última visita' })
    await expect(changes).toContainText('Fraqueza a Ice caiu para 2.')
    // Ice, Dragon and Fairy each went from 3 to 2.
    await expect(app.getByRole('img', { name: '1 fraco a menos que antes' })).toHaveCount(3)
    await expect(app.getByRole('status').filter({ hasText: 'Fraqueza a Ice' })).toHaveCount(1)

    // Seen: coming back without changes shows nothing new.
    await app.getByRole('button', { name: 'Time', exact: true }).click()
    await analysisTab.click()
    await expect(app.getByRole('heading', { name: 'Defesa' })).toBeVisible()
    await expect(changes).toHaveCount(0)
  })
})
