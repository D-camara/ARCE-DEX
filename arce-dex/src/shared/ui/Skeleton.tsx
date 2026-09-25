import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Loading placeholder. From 21st.dev `shadcn/skeleton` (MIT, shadcn/ui), adapted:
 * `bg-muted` → a parchment tint, because `muted` is a *text* color in this theme.
 * The pulse is the one allowed infinite animation (loading indicator) and stops under
 * prefers-reduced-motion via the global rule in index.css.
 */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-parchment/8', className)} {...props} />
}

export { Skeleton }
