import { expect, openApp, test } from './fixtures/fakePokeApi'

test.describe('diálogos', () => {
  test('Esc fecha e o foco volta para quem abriu', async ({ app }) => {
    await openApp(app)
    const opener = app.getByRole('button', { name: /inner focus/i })
    await opener.click()
    await expect(app.getByRole('dialog', { name: /inner focus/i })).toBeVisible()

    await app.keyboard.press('Escape')
    await expect(app.getByRole('dialog')).toHaveCount(0)
    await expect(opener).toBeFocused()
  })

  test('adicionar ao time pelo diálogo e ver no laboratório', async ({ app }) => {
    await openApp(app)
    await app.getByRole('button', { name: /adicionar à equipe/i }).click()
    await app.getByRole('button', { name: /^adicionar em/i }).click()
    await expect(app.getByRole('dialog')).toHaveCount(0)

    await app.getByRole('button', { name: /meu time/i }).click()
    await expect(app.getByText('Lucario').first()).toBeVisible()
    await expect(app.getByText('1/6 slots', { exact: false })).toBeVisible()
  })

  test('drawer de favoritos abre, fecha com Esc e não recebe Tab fechado', async ({ app }) => {
    await openApp(app)
    await app.getByRole('button', { name: 'Favoritar' }).click()
    await app.getByRole('button', { name: /favoritos/i }).click()
    await expect(app.getByRole('dialog', { name: 'Pokemon salvos' })).toBeVisible()

    await app.keyboard.press('Escape')
    await expect(app.locator('aside[inert]')).toHaveCount(1)
  })
})
