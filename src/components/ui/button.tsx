import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-mono tracking-widest uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-35',
  {
    variants: {
      variant: {
        default:     'bg-white text-black hover:bg-white/88 active:scale-[0.98] font-bold',
        outline:     'border-2 border-white text-white hover:bg-white hover:text-black active:scale-[0.98] font-bold',
        ghost:       'text-white/65 hover:text-white hover:bg-white/8',
        destructive: 'bg-red-900/40 border border-red-500/40 text-red-300 hover:bg-red-900/60',
        link:        'text-white/60 hover:text-white underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-12 px-8 text-sm',
        sm:      'h-10 px-5 text-xs',
        lg:      'h-14 px-10 text-base',
        icon:    'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
