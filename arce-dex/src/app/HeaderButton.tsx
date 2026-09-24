import type { ReactNode } from 'react'

type HeaderButtonProps = {
  icon: ReactNode
  label: string
  title?: string
  onClick: () => void
}

/** Pill button of the top bar; icon-only 44×44 circle on phones (label kept for screen readers). */
export function HeaderButton({ icon, label, title, onClick }: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-parchment/12 bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft transition-colors duration-150 hover:border-parchment/25 hover:bg-white/[0.08] hover:text-ivory max-sm:h-11 max-sm:w-11 max-sm:p-0"
      aria-label={label}
      title={title ?? label}
    >
      {icon}
      <span className="max-sm:hidden" aria-hidden="true">
        {label}
      </span>
    </button>
  )
}
