import { expect, openApp, test } from './fixtures/fakePokeApi'
import type { Page } from '@playwright/test'

/** Layout rules from docs/design-system/MASTER.md, checked on the real rendered page. */
async function audit(page: Page) {
  return page.evaluate(() => {
    const visible = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]')
    }
    const name = (el: Element) =>
      (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 30)
    const smallTargets = [...document.querySelectorAll('button, a[href], input, select, textarea, [role=tab]')]
      .filter(visible)
      .map((el) => ({ name: name(el), ...el.getBoundingClientRect().toJSON() }))
      .filter((el) => el.width < 44 || el.height < 44)
      .map((el) => `${el.name} ${Math.round(el.width)}x${Math.round(el.height)}`)
    const tinyText = [...document.querySelectorAll('body *')]
      .filter((el) => visible(el) && [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent?.trim()))
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12)
      .map((el) => `${name(el)} ${getComputedStyle(el).fontSize}`)
    const overflowing = [...document.querySelectorAll('body *')]
      .filter((el) => visible(el) && !el.closest('[role=tablist]') && getComputedStyle(el).position !== 'fixed')
      .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
      .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`)
    // Coverage is about the resting layout, so measure from the top of the page.
    window.scrollTo(0, 0)
    const header = document.querySelector('header')!.getBoundingClientRect()
    const content = (document.querySelector('main') ?? document.querySelector('header')!.nextElementSibling)!.getBoundingClientRect()
    return { smallTargets, tinyText, overflowing, headerCoversContent: content.top < header.bottom }
  })
}

const screens: Record<string, (page: Page) => Promise<void>> = {
  pokedex: async () => {},
  golpes: async (page) => page.getByRole('tab', { name: /golpes/i }).click(),
  busca: async (page) => page.getByRole('combobox').fill('ga'),
  time: async (page) => page.getByRole('button', { name: /meu time/i }).click(),
}

for (const [screen, open] of Object.entries(screens)) {
  test(`layout ok: ${screen}`, async ({ app }, testInfo) => {
    await openApp(app)
    await open(app)
    await app.waitForLoadState('networkidle')
    const result = await audit(app)

    expect(result.overflowing, 'nada mais largo que a tela').toEqual([])
    expect(result.tinyText, 'nenhum texto abaixo de 12px').toEqual([])
    expect(result.headerCoversContent, 'header não cobre o conteúdo').toBe(false)
    if (testInfo.project.name === 'mobile') {
      expect(result.smallTargets, 'alvos de toque ≥ 44px no celular').toEqual([])
    }
  })
}

test('header continua visível ao rolar', async ({ app }) => {
  await openApp(app, '/?tab=golpes')
  await app.mouse.wheel(0, 900)
  await expect.poll(() => app.evaluate(() => scrollY)).toBeGreaterThan(0)

  const top = await app.locator('header').first().evaluate((el) => el.getBoundingClientRect().top)
  expect(top).toBe(0)
})
