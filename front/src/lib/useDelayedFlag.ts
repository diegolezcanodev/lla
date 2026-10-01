'use client'

import { useEffect, useRef, useState } from 'react'

export function useDelayedFlag(active: boolean, delayMs = 100): boolean {
  const [flag, setFlag] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(() => setFlag(true), delayMs)
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      setFlag(false)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, delayMs])

  return flag
}
