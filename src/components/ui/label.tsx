import * as React from 'react'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('font-mono text-sm text-white/55 leading-none', className)} {...props} />
  )
)
Label.displayName = 'Label'

export { Label }
