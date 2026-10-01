'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

interface SmoothHeightProps {
  children: ReactNode
  className?: string
  overflow?: 'visible' | 'hidden'
}

export function SmoothHeight({ children, className, overflow = 'visible' }: SmoothHeightProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)
  const isInitial = useRef(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const h = Math.ceil(entries[0].contentRect.height)
      setHeight(h)
      if (isInitial.current) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isInitial.current = false
          })
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className={className}
      style={{
        height: height != null ? height : 'auto',
        transition: isInitial.current ? 'none' : 'height 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow,
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  )
}
