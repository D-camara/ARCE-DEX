import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { PokemonSummary } from '@/shared/types/pokemon'
import { SearchExperience } from './SearchExperience'

const summary = (id: number, name: string): PokemonSummary =>
  ({ id, name, displayName: name[0].toUpperCase() + name.slice(1), imageUrl: '', types: ['dragon'] }) as PokemonSummary

const suggestions = [summary(443, 'gible'), summary(444, 'gabite'), summary(445, 'garchomp')]

function renderSearch(overrides: Partial<Parameters<typeof SearchExperience>[0]> = {}) {
  const props = {
    suggestions,
    value: 'ga',
    isLoading: false,
    isError: false,
    isAutocompleteOpen: true,
    onChange: vi.fn(),
    onFocus: vi.fn(),
    onClose: vi.fn(),
    onSearch: vi.fn(),
    onSelect: vi.fn(),
    ...overrides,
  }
  render(<SearchExperience {...props} />)
  return props
}

describe('SearchExperience', () => {
  it('turns off mobile autocorrect/capitalization so Pokémon names are not "fixed"', () => {
    renderSearch()
    const input = screen.getByRole('combobox')

    expect(input).toHaveAttribute('autocorrect', 'off')
    expect(input).toHaveAttribute('autocapitalize', 'none')
    expect(input).toHaveAttribute('spellcheck', 'false')
    expect(input).toHaveAttribute('enterkeyhint', 'search')
  })

  it('lists suggestions as options of an expanded combobox', () => {
    renderSearch()

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
  })

  it('searches the typed text on Enter when nothing is highlighted', () => {
    const props = renderSearch()

    fireEvent.submit(screen.getByRole('search'))

    expect(props.onSearch).toHaveBeenCalledWith('ga')
    expect(props.onSelect).not.toHaveBeenCalled()
  })

  it('picks the highlighted suggestion with arrow keys + Enter', () => {
    const props = renderSearch()
    const input = screen.getByRole('combobox')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const firstOption = screen.getAllByRole('option')[0]
    expect(firstOption).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', firstOption.id)

    fireEvent.submit(screen.getByRole('search'))
    expect(props.onSelect).toHaveBeenCalledTimes(1)
    expect(props.onSearch).not.toHaveBeenCalled()
  })

  it('picks a suggestion on tap', () => {
    const props = renderSearch()

    fireEvent.click(screen.getAllByRole('option')[0])

    expect(props.onSelect).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape and on a tap outside, but not on a tap inside', () => {
    const props = renderSearch()

    fireEvent.pointerDown(screen.getByRole('combobox'))
    expect(props.onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(props.onClose).toHaveBeenCalledTimes(1)

    fireEvent.pointerDown(document.body)
    expect(props.onClose).toHaveBeenCalledTimes(2)
  })

  it('clears the field with the clear button', () => {
    const props = renderSearch()

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))

    expect(props.onChange).toHaveBeenCalledWith('')
  })

  it('suggests how to search when nothing matches', () => {
    renderSearch({ value: 'zzzz' })

    expect(screen.getByText(/Nenhum Pokémon encontrado para “zzzz”/)).toBeInTheDocument()
  })
})
