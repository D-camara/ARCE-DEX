import { X } from 'lucide-react'

type CloseButtonProps = {
  /** Screen-reader label, e.g. "Fechar favoritos". */
  label: string
  onClick: () => void
  tone?: 'default' | 'gold'
}

const toneClass = {
  default: 'border-line bg-white/[0.04]',
  gold: 'border-gilt-warm/26 bg-white/5',
}

/** The X in the corner of dialogs and drawers. */
export function CloseButton({ label, onClick, tone = 'default' }: CloseButtonProps) {
  return (
    <button
      className={`inline-grid h-11 w-11 place-items-center rounded-control border ${toneClass[tone]}`}
      type="button"
      onClick={onClick}
    >
      <X size={18} />
      <span className="sr-only">{label}</span>
    </button>
  )
}
