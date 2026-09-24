import { expect, openApp, test } from './fixtures/fakePokeApi'

test.describe('estado na URL', () => {
  test('link direto por id vira o nome e mantém a aba', async ({ app }) => {
    await openApp(app, '/?pokemon=445&tab=golpes')

    await expect(app).toHaveTitle(/^Garchomp/)
    await expect(app).toHaveURL(/\?pokemon=garchomp&tab=golpes$/)
    await expect(app.getByRole('tab', { name: /golpes/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('botão voltar desfaz a troca de tela, e F5 mantém o estado', async ({ app }) => {
    await openApp(app, '/?pokemon=garchomp')
    await app.getByRole('button', { name: /meu time/i }).click()
    await expect(app).toHaveURL(/view=team/)

    await app.goBack()
    await expect(app).not.toHaveURL(/view=team/)
    await expect(app).toHaveTitle(/^Garchomp/)

    await app.reload()
    await expect(app).toHaveTitle(/^Garchomp/)
  })

  test('URL inicial fica limpa com o Pokémon padrão', async ({ app }) => {
    await openApp(app)

    await expect(app).toHaveTitle(/^Lucario/)
    expect(new URL(app.url()).search).toBe('')
  })
})
