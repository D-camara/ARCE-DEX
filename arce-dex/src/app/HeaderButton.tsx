import type { ReactNode } from 'react'

type HeaderButtonProps = {
  icon: ReactNode
  label: string
  title?: string
  onClick: () => void
}

/** Pill button of the top bar; collapses to an icon-only circle on narrow phones. */
export function HeaderButton({ icon, label, title, onClick }: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-parchment/12 bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft transition-colors duration-150 hover:border-parchment/25 hover:bg-white/[0.08] hover:text-ivory max-md:min-h-[34px] max-xs:h-9 max-xs:w-9 max-xs:min-h-[36px] max-xs:min-w-[36px] max-xs:rounded-full max-xs:p-0"
      title={title}
    >
      {icon}
      <span className="max-xs:hidden">{label}</span>
    </button>
  )
}
