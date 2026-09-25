import { expect, openApp, test } from './fixtures/fakePokeApi'

test.describe('busca', () => {
  test('sugere enquanto digita, fecha com Esc e com toque fora', async ({ app }) => {
    await openApp(app)
    const box = app.getByRole('combobox')

    await box.fill('ga')
    await expect(app.getByRole('option').first()).toBeVisible()

    await box.press('Escape')
    await expect(app.getByRole('option')).toHaveCount(0)

    // Re-focusing (or typing again) reopens the list.
    await box.blur()
    await box.focus()
    await expect(app.getByRole('option').first()).toBeVisible()
    await app.mouse.click(5, 600)
    await expect(app.getByRole('option')).toHaveCount(0)
  })

  test('setas + Enter escolhem a sugestão e atualizam a URL', async ({ app }) => {
    await openApp(app)
    await app.getByRole('combobox').fill('garc')
    await app.keyboard.press('ArrowDown')
    await app.keyboard.press('Enter')

    await expect(app).toHaveTitle(/^Garchomp/)
    await expect(app).toHaveURL(/pokemon=garchomp/)
    await expect(app.getByRole('combobox')).not.toBeFocused()
  })

  test('Enter sem sugestão destacada busca o texto digitado', async ({ app }) => {
    await openApp(app)
    await app.getByRole('combobox').fill('445')
    await app.keyboard.press('Enter')

    await expect(app).toHaveTitle(/^Garchomp/)
  })

  test('sem resultado sugere o que tentar', async ({ app }) => {
    await openApp(app)
    await app.getByRole('combobox').fill('zzzz')

    await expect(app.getByText(/Nenhum Pokémon encontrado para “zzzz”/)).toBeVisible()
  })

  test('o campo não autocorrige nomes no teclado do celular', async ({ app }) => {
    await openApp(app)
    const box = app.getByRole('combobox')

    await expect(box).toHaveAttribute('autocorrect', 'off')
    await expect(box).toHaveAttribute('autocapitalize', 'none')
    await expect(box).toHaveAttribute('spellcheck', 'false')
  })
})
