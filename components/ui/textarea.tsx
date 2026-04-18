import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-[22px] border bg-white/74 px-4 py-3 text-base shadow-[0_18px_44px_-34px_rgba(92,111,189,0.34)] outline-none backdrop-blur-md focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/7 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
