'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  name?: string
  label?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
  className?: string
  dropUp?: boolean
  centerOptions?: boolean
}

export function Select({
  options,
  value,
  onChange,
  name,
  label,
  id,
  placeholder,
  disabled,
  error,
  className,
  dropUp = false,
  centerOptions = false,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [focusIdx, setFocusIdx] = useState(-1)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; dropUp: boolean } | null>(null)
  const [mounted, setMounted] = useState(false)
  const openRef = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const computePos = useCallback(() => {
    if (!ref.current) return null
    const r = ref.current.getBoundingClientRect()
    const espacioAbajo = window.innerHeight - r.bottom
    const espacioArriba = r.top
    const shouldDropUp = dropUp || (espacioAbajo < 250 && espacioArriba > espacioAbajo)
    const top = shouldDropUp ? r.top - 4 : r.bottom + 4
    return { top, left: r.left, width: r.width, dropUp: shouldDropUp }
  }, [dropUp])

  const openMenu = useCallback(() => {
    const p = computePos()
    if (p) setPos(p)
    setOpen(true)
    openRef.current = true
    setFocusIdx(0)
  }, [computePos])

  const closeMenu = useCallback(() => {
    setOpen(false)
    openRef.current = false
    setPos(null)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      if (openRef.current) closeMenu()
    }
    function handleScroll(e: Event) {
      if (openRef.current) {
        if (listRef.current?.contains(e.target as Node)) return
        closeMenu()
      }
    }
    function handleResize() {
      if (openRef.current) {
        const p = computePos()
        if (p) setPos(p)
      }
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [closeMenu, computePos])

  useEffect(() => {
    if (open && focusIdx >= 0 && listRef.current) {
      const el = listRef.current.children[focusIdx] as HTMLElement | undefined
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, focusIdx])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openMenu()
        }
        return
      }
      if (e.key === 'Escape') {
        closeMenu()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusIdx(p => Math.min(p + 1, options.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusIdx(p => Math.max(p - 1, 0))
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const opt = options[focusIdx]
        if (opt && !opt.disabled) {
          onChange(opt.value)
          closeMenu()
        }
      }
    },
    [open, options, focusIdx, onChange, openMenu, closeMenu],
  )

  const selectedLabel =
    placeholder && !value
      ? placeholder
      : options.find(o => o.value === value)?.label ?? placeholder ?? ''

  const buttonClass = `w-full flex items-center justify-between border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary disabled:opacity-50 px-3 py-2 rounded-md ${
    error ? 'border-danger' : 'border-border'
  } ${className ?? ''}`

  const listboxId = id ? `${id}-listbox` : undefined

  const button = (
    <button
      type="button"
      id={id}
      aria-label={label || undefined}
      onClick={() => {
        if (!open) openMenu()
        else closeMenu()
      }}
      disabled={disabled}
      className={buttonClass}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={open ? listboxId : undefined}
    >
      <span className={!value ? 'text-text-tertiary' : 'text-text-primary truncate'}>
        {selectedLabel}
      </span>
      <ChevronDown
        size={16}
        className={`text-text-tertiary shrink-0 transition-transform ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
  )

  const dropdown =
    open && pos && mounted
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              top: pos.dropUp ? 'auto' : pos.top,
              bottom: pos.dropUp ? `calc(100vh - ${pos.top}px)` : 'auto',
              left: pos.left,
              width: pos.width,
            }}
            className="z-[80] bg-white border border-border rounded-md shadow-lg overflow-hidden"
          >
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="select-dropdown-scroll max-h-60 overflow-y-auto py-1"
            >
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-text-tertiary">Sin opciones</div>
              )}
              {options.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  role="option"
                  aria-selected={!!(opt.value && opt.value === value)}
                  onClick={() => {
                    onChange(opt.value)
                    closeMenu()
                  }}
                  onMouseEnter={() => setFocusIdx(i)}
                  className={`w-full ${
                    centerOptions ? 'text-center' : 'text-left'
                  } px-3 py-2 text-sm transition-colors ${
                    opt.value && opt.value === value
                      ? `bg-accent text-white font-medium ${focusIdx === i ? 'bg-accent-hover' : ''}`
                      : `${
                          focusIdx === i ? 'bg-bg-secondary' : 'hover:bg-bg-secondary'
                        } text-text-primary`
                  } ${opt.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )
      : null

  if (!label) {
    return (
      <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
        {name && <input type="hidden" name={name} value={value} />}
        {button}
        {dropdown}
      </div>
    )
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
        {name && <input type="hidden" name={name} value={value} />}
        {button}
        {dropdown}
      </div>
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  )
}