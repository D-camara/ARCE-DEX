import { expect, openApp, test } from './fixtures/fakePokeApi'
import { addToTeam } from './fixtures/motion'
import type { Page } from '@playwright/test'

const slotNames = (page: Page) =>
  page
    .getByRole('region', { name: 'Slots do time' })
    .locator(':scope > div')
    .evaluateAll((slots) => slots.map((slot) => slot.querySelector('strong')?.textContent ?? ''))

/** Team order as persisted in IndexedDB (localForage), so a reload can't race the write. */
const persistedOrder = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<string[]>((resolve) => {
        const open = indexedDB.open('ARCE-DEX')
        open.onsuccess = () => {
          // localForage turns the store name 'user-data' into 'user_data'.
          const read = open.result.transaction('user_data').objectStore('user_data').get('arce-dex:team-store')
          read.onsuccess = () => {
            const state = JSON.parse(read.result ?? '{}').state
            resolve((state?.teams?.[0]?.slots ?? []).map((slot: { pokemon: { name: string } | null }) => slot.pokemon?.name ?? ''))
          }
        }
      }),
  )

async function openOrganizer(page: Page) {
  await openApp(page)
  await addToTeam(page, ['garchomp', 'gible', 'lucario'])
  await page.getByRole('button', { name: /meu time/i }).click()
  await page.getByRole('button', { name: 'Organizar' }).click()
  await expect(page.getByRole('button', { name: 'Concluir' })).toHaveAttribute('aria-pressed', 'true')
}

test.describe('reordenar o time', () => {
  test('botões Antes/Depois movem, mantêm o foco, anunciam e a ordem sobrevive ao reload', async ({ app }) => {
    await openOrganizer(app)
    expect((await slotNames(app)).slice(0, 3)).toEqual(['Garchomp', 'Gible', 'Lucario'])

    // Keyboard only: focus the button and press Enter.
    await app.getByRole('button', { name: 'Mover Garchomp para a posição 2' }).focus()
    await app.keyboard.press('Enter')

    await expect.poll(async () => (await slotNames(app)).slice(0, 3)).toEqual(['Gible', 'Garchomp', 'Lucario'])
    await expect(app.getByRole('button', { name: 'Mover Garchomp para a posição 3' })).toBeFocused()
    await expect(app.getByRole('status').filter({ hasText: 'Garchomp movido para a posição 2 de 6.' })).toHaveCount(1)
    // First slot can't go back: that button is disabled.
    await expect(app.getByRole('button', { name: 'Mover Gible para a posição 0' })).toBeDisabled()

    await expect.poll(async () => (await persistedOrder(app)).slice(0, 3)).toEqual(['gible', 'garchomp', 'lucario'])
    await app.reload()
    await app.getByRole('button', { name: /meu time/i }).click()
    await expect.poll(async () => (await slotNames(app)).slice(0, 3)).toEqual(['Gible', 'Garchomp', 'Lucario'])
  })

  test('arrastar pela alça reordena (mouse) e Esc cancela', async ({ app }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'arrasto com mouse: desktop; toque é coberto pelos botões e à parte')
    await openOrganizer(app)
    const region = app.getByRole('region', { name: 'Slots do time' })
    const handle = region.locator('[data-slot-key^="pokemon-448"] [data-drag-handle]')
    await handle.scrollIntoViewIfNeeded()

    async function dragLucarioTo(target: { x: number; y: number }, beforeDrop?: () => Promise<void>) {
      const box = (await handle.boundingBox())!
      await app.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await app.mouse.down()
      for (let step = 1; step <= 15; step += 1) {
        await app.mouse.move(
          box.x + box.width / 2 + ((target.x - box.x - box.width / 2) * step) / 15,
          box.y + box.height / 2 + ((target.y - box.y - box.height / 2) * step) / 15,
        )
      }
      await beforeDrop?.()
      await app.mouse.up()
    }

    const first = (await region.locator(':scope > div').first().boundingBox())!
    const firstCenter = { x: first.x + first.width / 2, y: first.y + first.height / 2 }

    // Esc mid-drag: nothing changes, and the card is back in place (no leftover offset).
    await dragLucarioTo(firstCenter, () => app.keyboard.press('Escape'))
    await expect.poll(async () => (await slotNames(app)).slice(0, 3)).toEqual(['Garchomp', 'Gible', 'Lucario'])
    const lucario = region.locator('[data-slot-key^="pokemon-448"]')
    await expect.poll(() => lucario.evaluate((el) => getComputedStyle(el).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)

    await dragLucarioTo(firstCenter)
    await expect.poll(async () => (await slotNames(app)).slice(0, 3)).toEqual(['Lucario', 'Garchomp', 'Gible'])
    await expect(app.getByRole('status').filter({ hasText: 'Lucario movido para a posição 1 de 6.' })).toHaveCount(1)
    expect(await app.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  })

  test('arrastar com o dedo pela alça (tela de toque)', async ({ app }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'toque: projeto tablet (hasTouch)')
    await openOrganizer(app)
    const region = app.getByRole('region', { name: 'Slots do time' })
    const handle = region.locator('[data-slot-key^="pokemon-448"] [data-drag-handle]')
    await handle.scrollIntoViewIfNeeded()
    const box = (await handle.boundingBox())!
    const first = (await region.locator(':scope > div').first().boundingBox())!
    const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    const to = { x: first.x + first.width / 2, y: first.y + first.height / 2 }

    // Real touch events (pointerType "touch"), which Playwright's mouse can't produce.
    const cdp = await app.context().newCDPSession(app)
    const touch = (type: string, point?: { x: number; y: number }) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [{ x: point.x, y: point.y }] : [] })
    await touch('touchStart', from)
    for (let step = 1; step <= 15; step += 1) {
      await touch('touchMove', { x: from.x + ((to.x - from.x) * step) / 15, y: from.y + ((to.y - from.y) * step) / 15 })
    }
    await touch('touchEnd')

    await expect.poll(async () => (await slotNames(app)).slice(0, 3)).toEqual(['Lucario', 'Garchomp', 'Gible'])
  })

  test('dedo fora da alça rola a página em vez de arrastar', async ({ app }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'toque: projeto tablet (hasTouch)')
    await openOrganizer(app)
    const card = app.getByRole('region', { name: 'Slots do time' }).locator('[data-slot-key^="pokemon-445"] strong').first()
    await card.scrollIntoViewIfNeeded()
    const box = (await card.boundingBox())!
    const before = await app.evaluate(() => scrollY)

    // A finger swiping up over the card's text (not the handle).
    const cdp = await app.context().newCDPSession(app)
    const start = { x: box.x + 10, y: box.y + 10 }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] })
    for (let step = 1; step <= 10; step += 1) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x, y: start.y - step * 25 }] })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })

    await expect.poll(() => app.evaluate(() => scrollY)).toBeGreaterThan(before)
    expect((await slotNames(app)).slice(0, 3)).toEqual(['Garchomp', 'Gible', 'Lucario'])
  })

  test('fora do modo Organizar: sem alça, com Editar e Remover', async ({ app }) => {
    await openOrganizer(app)
    await app.getByRole('button', { name: 'Concluir' }).click()
    await expect(app.locator('[data-drag-handle]')).toHaveCount(0)
    await expect(app.getByRole('button', { name: 'Editar' })).toHaveCount(3)
  })
})
