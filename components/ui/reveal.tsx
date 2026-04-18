"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
}

export function Reveal({
  as = "div",
  className,
  delay = 0,
  children,
  style,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotion.matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.unobserve(entry.target)
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -12% 0px",
      },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const Comp = as as React.ElementType

  return (
    <Comp
      ref={ref}
      data-visible={isVisible ? "true" : "false"}
      className={cn("reveal-scroll", className)}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Comp>
  )
}
