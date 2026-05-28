import { describe, expect, it } from 'vitest'
import { calculateHiddenPowerType, normalizeHiddenPowerIvs } from '.'

describe('hidden power calculator', () => {
  it('calculates Dark for perfect IVs', () => {
    const result = calculateHiddenPowerType()

    expect(result.type).toBe('dark')
    expect(result.typeIndex).toBe(15)
    expect(result.weightedValue).toBe(63)
    expect(result.isPerfectIvSpread).toBe(true)
  })

  it('calculates Fighting for all even IVs', () => {
    const result = calculateHiddenPowerType({
      hp: 30,
      attack: 30,
      defense: 30,
      speed: 30,
      'special-attack': 30,
      'special-defense': 30,
    })

    expect(result.type).toBe('fighting')
    expect(result.typeIndex).toBe(0)
    expect(result.weightedValue).toBe(0)
  })

  it('uses parity from HP and Attack bits', () => {
    const result = calculateHiddenPowerType({
      hp: 31,
      attack: 31,
      defense: 30,
      speed: 30,
      'special-attack': 30,
      'special-defense': 30,
    })

    expect(result.bits.hp).toBe(1)
    expect(result.bits.attack).toBe(1)
    expect(result.weightedValue).toBe(3)
    expect(result.type).toBe('fighting')
  })

  it('calculates Fire for the classic Fire parity spread', () => {
    const result = calculateHiddenPowerType({
      hp: 31,
      attack: 30,
      defense: 31,
      speed: 30,
      'special-attack': 30,
      'special-defense': 31,
    })

    expect(result.weightedValue).toBe(37)
    expect(result.type).toBe('fire')
  })

  it('calculates Ice for the classic Ice parity spread', () => {
    const result = calculateHiddenPowerType({
      hp: 31,
      attack: 30,
      defense: 30,
      speed: 31,
      'special-attack': 31,
      'special-defense': 31,
    })

    expect(result.weightedValue).toBe(57)
    expect(result.type).toBe('ice')
  })

  it('uses safe defaults for incomplete input', () => {
    const result = calculateHiddenPowerType({
      hp: 30,
    })

    expect(result.ivs.hp).toBe(30)
    expect(result.ivs.attack).toBe(31)
    expect(result.ivs['special-defense']).toBe(31)
    expect(result.type).toBe('dragon')
    expect(result.isPerfectIvSpread).toBe(false)
  })

  it('clamps invalid IV input safely', () => {
    expect(
      normalizeHiddenPowerIvs({
        hp: 99,
        attack: -5,
        defense: Number.NaN,
      }),
    ).toMatchObject({
      hp: 31,
      attack: 0,
      defense: 31,
    })
  })
})
