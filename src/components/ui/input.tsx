import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full border border-white/15 bg-transparent px-4 py-2.5 font-mono text-base text-white placeholder:text-white/28 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed h-12',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
