import type { ReactNode } from 'react'
import * as m from 'motion/react-m'
import { spring } from '@/shared/ui'

type HeaderButtonProps = {
  icon: ReactNode
  label: string
  title?: string
  onClick: () => void
}

/**
 * Pill button of the top bar. Icon-only 44×44 circle below `lg` (phones and tablets — on a
 * tablet the labels squeezed the search field); 44px tall on any touch screen.
 */
export function HeaderButton({ icon, label, title, onClick }: HeaderButtonProps) {
  return (
    <m.button
      whileTap={{ scale: 0.95 }}
      transition={spring.snappy}
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-parchment/12 bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft transition-colors duration-150 hover:border-parchment/25 hover:bg-white/[0.08] hover:text-ivory pointer-coarse:min-h-11 max-lg:h-11 max-lg:w-11 max-lg:p-0"
      aria-label={label}
      title={title ?? label}
    >
      {icon}
      <span className="max-lg:hidden" aria-hidden="true">
        {label}
      </span>
    </m.button>
  )
}
