"use client"
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-blue-600 focus-visible:ring-primary',
        secondary: 'bg-secondary text-white hover:bg-emerald-600 focus-visible:ring-secondary',
        ghost: 'bg-transparent hover:bg-gray-100',
        outline: 'border border-gray-200 hover:bg-gray-50'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
