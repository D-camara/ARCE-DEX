import { expect, test } from './fixtures/fakePokeApi'

test('mostra o skeleton no formato do card enquanto o Pokémon carrega', async ({ app }) => {
  // Hold the Pokémon request until the skeleton has been checked.
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await app.route('https://pokeapi.co/api/v2/pokemon/448', async (route) => {
    await gate
    await route.fallback()
  })

  await app.goto('/')
  const skeleton = app.getByRole('status', { name: 'Carregando Pokémon' })
  await expect(skeleton).toBeVisible()
  const skeletonBox = await skeleton.boundingBox()

  release()
  await expect(app).toHaveTitle(/^Lucario/)
  await expect(skeleton).toHaveCount(0)
  const cardBox = await app.locator('main article').first().boundingBox()

  // Same frame: width identical, height close enough that the page doesn't visibly jump.
  expect(cardBox!.width).toBeCloseTo(skeletonBox!.width, 0)
  expect(Math.abs(cardBox!.height - skeletonBox!.height)).toBeLessThan(cardBox!.height * 0.15)
})
