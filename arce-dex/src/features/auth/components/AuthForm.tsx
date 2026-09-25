import { useEffect, useId, useState } from 'react'
import { Dialog } from '@/shared/ui'
import { connectAuth } from '../store/authStore'

type AuthFormProps = {
  onClose: () => void
}

export function AuthForm({ onClose }: AuthFormProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const titleId = useId()

  // Start loading supabase-js as soon as the form opens, so submitting doesn't wait on it.
  useEffect(() => {
    void connectAuth()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const supabase = await connectAuth()
    if (!supabase) {
      return
    }
    setError(null)
    setIsSubmitting(true)

    const { error: authError } =
      mode === 'sign-up'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

    setIsSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === 'sign-up') {
      setConfirmationSent(true)
      return
    }

    onClose()
  }

  if (confirmationSent) {
    return (
      <Dialog
        isOpen
        onClose={onClose}
        labelledBy={titleId}
        className="w-[min(420px,100%)] gap-3 rounded-2xl border border-line bg-ink-blue/98 p-5 text-ivory"
      >
        <h2 id={titleId}>Confirme seu email</h2>
        <p className="text-ivory-soft">
          Enviamos um link de confirmação para {email}. Clique nele antes de entrar.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-control border border-line-gold px-4 py-2 text-sm text-gold"
        >
          Fechar
        </button>
      </Dialog>
    )
  }

  return (
    <Dialog
      isOpen
      onClose={onClose}
      labelledBy={titleId}
      className="w-[min(420px,100%)] gap-3 rounded-2xl border border-line bg-ink-blue/98 p-5 text-ivory"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 id={titleId}>{mode === 'sign-up' ? 'Criar conta' : 'Entrar'}</h2>
        <button type="button" onClick={onClose} className="text-ivory-soft">
          Fechar
        </button>
      </header>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <label className="grid gap-1.5 text-[0.78rem] font-extrabold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full min-h-[46px] rounded-xl border border-line bg-panel/60 px-2.5 py-2 text-ivory"
          />
        </label>
        <label className="grid gap-1.5 text-[0.78rem] font-extrabold">
          Senha
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full min-h-[46px] rounded-xl border border-line bg-panel/60 px-2.5 py-2 text-ivory"
          />
        </label>
        {error && <p className="text-sm text-danger-rose-200">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[46px] items-center justify-center rounded-control border border-line-gold bg-gilt/16 font-extrabold text-ivory disabled:opacity-50"
        >
          {mode === 'sign-up' ? 'Criar conta' : 'Entrar'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
        className="text-sm text-gold"
      >
        {mode === 'sign-up' ? 'Já tenho conta' : 'Criar conta nova'}
      </button>
    </Dialog>
  )
}
