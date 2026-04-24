import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
        outline:
          'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
        ghost:
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        link:
          'text-blue-600 underline-offset-4 hover:underline',
        success:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800',
        warning:
          'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:bg-amber-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 px-6',
        xl: 'h-11 px-8 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
