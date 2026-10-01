'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import { StatusBadge, type BadgeSize } from './StatusBadge'

export interface StatusOption {
  value: string
  label?: string
  disabled?: boolean
}

export interface StatusBadgeDropdownProps {
  value: string
  options: (StatusOption | string)[]
  onChange: (newValue: string) => void
  disabled?: boolean
  size?: BadgeSize
  align?: 'left' | 'right'
  title?: string
  className?: string
  ariaLabel?: string
}

export function StatusBadgeDropdown({
  value,
  options,
  onChange,
  disabled = false,
  size = 'md',
  align = 'left',
  title = 'Click para cambiar estado',
  className = '',
  ariaLabel,
}: StatusBadgeDropdownProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; dropUp: boolean } | null>(null)

  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const normalizedOptions: StatusOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt } : opt,
  )

  const computePos = useCallback(() => {
    if (!triggerRef.current) return null
    const r = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const spaceAbove = r.top
    const dropdownHeight = normalizedOptions.length * 36 + 40
    const shouldDropUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

    const top = shouldDropUp ? r.top - 6 : r.bottom + 6

    const dropdownWidth = 175
    let left = align === 'right' ? r.right - dropdownWidth : r.left
    if (left + dropdownWidth > window.innerWidth - 12) {
      left = window.innerWidth - dropdownWidth - 12
    }
    if (left < 12) {
      left = 12
    }

    return { top, left, dropUp: shouldDropUp }
  }, [align, normalizedOptions.length])

  const openMenu = useCallback(() => {
    if (disabled) return
    const p = computePos()
    if (p) setPos(p)
    setOpen(true)
  }, [disabled, computePos])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setPos(null)
  }, [])

  useEffect(() => {
    if (!open) return

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      closeMenu()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }

    function handleScroll(e: Event) {
      if (menuRef.current?.contains(e.target as Node)) return
      closeMenu()
    }

    function handleResize() {
      closeMenu()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [open, closeMenu])

  if (disabled) {
    return <StatusBadge status={value} size={size} className={className} />
  }

  const dropdownContent =
    open && pos && mounted
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: pos.dropUp ? 'auto' : pos.top,
              bottom: pos.dropUp ? `calc(100vh - ${pos.top}px)` : 'auto',
              left: pos.left,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
            className="min-w-[170px] bg-white border border-border/80 rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="text-[10px] font-semibold text-text-tertiary px-2 py-1 uppercase tracking-wider select-none">
              Cambiar estado
            </div>
            <div className="space-y-0.5" role="listbox">
              {normalizedOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (opt.value !== value) {
                        onChange(opt.value)
                      }
                      closeMenu()
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-bg-secondary font-semibold text-text-primary'
                        : 'hover:bg-bg-secondary/60 text-text-secondary hover:text-text-primary'
                    } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <StatusBadge status={opt.value} label={opt.label} size="sm" />
                    {isSelected && <Check size={13} className="text-primary shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div
      ref={triggerRef}
      className={`inline-flex shrink-0 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (open) closeMenu()
          else openMenu()
        }}
        title={title}
        aria-label={ariaLabel || title}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="focus:outline-none focus:ring-2 focus:ring-accent/30 rounded-full"
      >
        <StatusBadge
          status={value}
          size={size}
          showChevron={true}
          chevronOpen={open}
          interactive={true}
        />
      </button>
      {dropdownContent}
    </div>
  )
}
