/**
 * Typography — reusable text components used across all pages.
 * One source of truth for all text styles.
 */
import { cn } from '@/lib/utils'

// ── Page titles (hero headings, product names, big statements)
export function Heading1({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn('font-heading text-[clamp(3rem,8vw,6rem)] leading-none text-white', className)}>{children}</h1>
}

// ── Section headings
export function Heading2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('font-sans text-2xl sm:text-3xl font-semibold text-white', className)}>{children}</h2>
}

// ── Sub-headings / card titles
export function Heading3({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('font-sans text-xl font-semibold text-white', className)}>{children}</h3>
}

// ── Display italic — used for taglines, product subtitles, editorial pull-quotes
export function Display({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('font-display text-2xl sm:text-3xl italic text-white/70 leading-snug', className)}>{children}</p>
}

// ── Body text — readable prose
export function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('font-sans text-base sm:text-lg text-white/70 leading-relaxed', className)}>{children}</p>
}

// ── Small body — secondary info
export function BodySm({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('font-sans text-sm text-white/55 leading-relaxed', className)}>{children}</p>
}

// ── Label — mono caps, used for categories, tags, eyebrows above headings
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('font-mono text-xs tracking-widest uppercase text-white/40', className)}>{children}</p>
}

// ── Price display
export function Price({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('price-display text-2xl font-bold text-white', className)}>{children}</span>
}

// ── Page wrapper for content pages (legal, account, etc.)
export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('max-w-3xl mx-auto px-6 sm:px-8 pt-28 pb-24', className)}>
      {children}
    </div>
  )
}

// ── Section divider used in legal / content pages
export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <Heading2>{title}</Heading2>
      {children}
    </section>
  )
}
