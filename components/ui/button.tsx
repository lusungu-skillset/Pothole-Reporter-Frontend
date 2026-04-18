import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "font-primary inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent text-sm font-semibold tracking-[0.01em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-blue-500 to-cyan-400 text-primary-foreground shadow-[0_24px_58px_-30px_rgba(78,96,216,0.85)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_32px_72px_-30px_rgba(78,96,216,0.9)] active:translate-y-0 active:scale-[0.99]",
        destructive:
          "bg-gradient-to-r from-destructive via-rose-500 to-orange-400 text-white shadow-[0_24px_58px_-30px_rgba(220,38,38,0.72)] hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border/70 bg-white/76 text-foreground shadow-[0_18px_44px_-34px_rgba(92,111,189,0.38)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white/92 hover:text-foreground dark:border-white/10 dark:bg-white/7 dark:hover:bg-white/12",
        secondary:
          "border-secondary/40 bg-secondary/82 text-secondary-foreground shadow-[0_18px_44px_-34px_rgba(103,182,214,0.26)] hover:-translate-y-0.5 hover:bg-secondary",
        ghost:
          "text-foreground hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground hover:shadow-[0_18px_40px_-34px_rgba(92,111,189,0.26)] dark:hover:bg-white/8 dark:hover:text-white",
        link: "rounded-none border-none p-0 text-primary shadow-none hover:text-primary/80 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 text-xs has-[>svg]:px-3",
        lg: "h-12 px-7 text-sm has-[>svg]:px-5",
        icon: "size-11 rounded-2xl",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
