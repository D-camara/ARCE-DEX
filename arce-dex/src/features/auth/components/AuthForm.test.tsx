import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AuthForm } from './AuthForm'

describe('AuthForm', () => {
  it('starts in sign-in mode', () => {
    render(<AuthForm onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('switches to sign-up mode when "Criar conta nova" is clicked', () => {
    render(<AuthForm onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta nova' }))

    expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Já tenho conta' })).toBeInTheDocument()
  })

  it('calls onClose when "Fechar" is clicked', () => {
    const onClose = vi.fn()
    render(<AuthForm onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
