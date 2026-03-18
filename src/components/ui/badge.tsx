import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center border font-mono text-xs tracking-widest uppercase px-2.5 py-1 transition-colors',
  {
    variants: {
      variant: {
        default:     'border-white/25 bg-white/6 text-white/70',
        secondary:   'border-white/12 bg-white/3 text-white/45',
        destructive: 'border-red-500/40 bg-red-500/10 text-red-400/90',
        outline:     'border-white/25 text-white/60',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
