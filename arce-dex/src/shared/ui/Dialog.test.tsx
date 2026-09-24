import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Dialog } from './Dialog'

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => {
    onClose()
    setIsOpen(false)
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Abrir
      </button>
      <Dialog isOpen={isOpen} onClose={close} labelledBy="dialog-title">
        <h2 id="dialog-title">Detalhes</h2>
        <button type="button">Primeiro</button>
        <button type="button">Último</button>
      </Dialog>
    </>
  )
}

function openDialog() {
  const opener = screen.getByRole('button', { name: 'Abrir' })
  opener.focus()
  fireEvent.click(opener)
  return opener
}

describe('Dialog', () => {
  it('is exposed as a modal named by its heading', () => {
    render(<Harness />)
    openDialog()

    expect(screen.getByRole('dialog', { name: 'Detalhes' })).toHaveAttribute('aria-modal', 'true')
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    openDialog()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on a click on the overlay but not inside the panel', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    openDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Primeiro' }))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('moves focus inside on open and back to the opener on close', () => {
    render(<Harness />)
    const opener = openDialog()

    expect(screen.getByRole('button', { name: 'Primeiro' })).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(opener).toHaveFocus()
  })

  it('keeps Tab inside the dialog', () => {
    render(<Harness />)
    openDialog()
    screen.getByRole('button', { name: 'Último' }).focus()

    fireEvent.keyDown(document, { key: 'Tab' })

    expect(screen.getByRole('button', { name: 'Primeiro' })).toHaveFocus()
  })

  it('locks page scroll while open', () => {
    render(<Harness />)
    openDialog()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.body.style.overflow).toBe('')
  })

  it('closes only the topmost of two stacked dialogs on Escape, keeping the page locked', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()
    render(
      <>
        <Dialog isOpen onClose={closeBottom} labelledBy="bottom">
          <h2 id="bottom">Embaixo</h2>
        </Dialog>
        <Dialog isOpen onClose={closeTop} labelledBy="top">
          <h2 id="top">Em cima</h2>
        </Dialog>
      </>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).not.toHaveBeenCalled()
    expect(document.body.style.overflow).toBe('hidden')
  })
})
