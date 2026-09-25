import type { Page } from '@playwright/test'

export type OverflowWindow = Window & { __worstOverflow: number; __watchOverflowUntil: number }

/** In-page sampler: every frame, records how far the page could be scrolled sideways. */
export function sampleOverflow(durationMs: number) {
  const w = window as OverflowWindow
  w.__worstOverflow = 0
  w.__watchOverflowUntil = performance.now() + durationMs
  const sample = () => {
    const root = document.scrollingElement ?? document.documentElement
    w.__worstOverflow = Math.max(w.__worstOverflow, root.scrollWidth - root.clientWidth)
    if (performance.now() < w.__watchOverflowUntil) requestAnimationFrame(sample)
  }
  requestAnimationFrame(sample)
}

/** Runs `action` while sampling, then returns the worst horizontal overflow seen (px). */
export async function worstOverflowDuring(page: Page, ms: number, action: () => Promise<void>) {
  await page.evaluate(sampleOverflow, ms)
  await action()
  await page.waitForTimeout(ms)
  return page.evaluate(() => (window as OverflowWindow).__worstOverflow)
}
