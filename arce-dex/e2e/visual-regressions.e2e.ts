import { expect, openApp, test } from './fixtures/fakePokeApi'
import type { Locator } from '@playwright/test'

/** True when nothing (e.g. the sticky app header) is painted over the element's center. */
async function isOnTop(locator: Locator) {
  return locator.evaluate((el) => {
    const box = el.getBoundingClientRect()
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
    return !!hit && (el === hit || el.contains(hit))
  })
}

test.describe('regressões visuais do QA', () => {
  test('diálogos ficam acima do header: botão de fechar visível e clicável', async ({ app }) => {
    await openApp(app)
    await app.getByRole('button', { name: /adicionar à equipe/i }).click()
    const dialog = app.getByRole('dialog')
    const close = dialog.getByRole('button', { name: 'Fechar seletor' })
    await expect(close).toBeVisible()
    // Title, close button and the panel's top edge must all be painted above the sticky header.
    await expect.poll(() => isOnTop(close)).toBe(true)
    expect(await isOnTop(dialog.getByRole('heading', { name: 'Lucario' }))).toBe(true)
    const topEdgeCovered = await dialog.evaluate((panel) => {
      const box = panel.getBoundingClientRect()
      const hit = document.elementFromPoint(box.left + box.width / 2, Math.max(box.top + 6, 1))
      return !panel.contains(hit)
    })
    expect(topEdgeCovered).toBe(false)
    await close.click()
    await expect(app.getByRole('dialog')).toHaveCount(0)
  })

  test('drawer de favoritos fica acima do header', async ({ app }) => {
    await openApp(app)
    await app.locator('header').first().getByRole('button', { name: /favoritos/i }).click()
    const close = app.getByRole('button', { name: 'Fechar favoritos' })
    await expect(close).toBeVisible()
    // The drawer slides in: wait until it has landed before hit-testing.
    await expect.poll(() => isOnTop(close)).toBe(true)
  })

  test('Pokémon inexistente explica o erro e oferece saída', async ({ app }) => {
    await openApp(app, '/?pokemon=missingno')
    await expect(app.getByRole('alert')).toContainText('Não encontramos')
    await app.getByRole('button', { name: 'Voltar ao início' }).click()
    await expect(app).toHaveTitle(/^Lucario/)
  })

  test('cards de favoritos não se sobrepõem', async ({ app }) => {
    await openApp(app)
    for (const name of ['garchomp', 'gible', 'gabite', 'riolu']) {
      await app.goto(`/?pokemon=${name}`)
      await app.getByRole('button', { name: 'Favoritar' }).click()
    }
    await app.locator('header').first().getByRole('button', { name: /favoritos/i }).click()
    const boxes = await app.getByRole('dialog', { name: 'Pokémon salvos' }).locator('article').evaluateAll((els) =>
      els.map((el) => { const r = el.getBoundingClientRect(); return [r.top, r.bottom, el.scrollHeight, el.clientHeight] }),
    )
    expect(boxes.length).toBeGreaterThan(1)
    for (let i = 1; i < boxes.length; i++) expect(boxes[i][0]).toBeGreaterThanOrEqual(boxes[i - 1][1])
    for (const [, , scrollH, clientH] of boxes) expect(scrollH).toBeLessThanOrEqual(clientH + 1)
  })
})
