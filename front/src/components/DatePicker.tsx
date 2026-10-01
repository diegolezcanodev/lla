'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  id: string
  label?: string
  placeholder?: string
  className?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
  mode?: 'date' | 'month'
  labelClassName?: string
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

type ViewMode = 'days' | 'months' | 'years'

function parseDate(s: string | undefined): Date | null {
  if (!s) return null
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function formatISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplay(s: string | undefined): string {
  const d = parseDate(s)
  if (!d) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${m}/${d.getFullYear()}`
}

function formatMonthDisplay(s: string | undefined): string {
  const d = parseDate(s)
  if (!d) return ''
  return `${MESES_CORTO[d.getMonth()]}/${d.getFullYear()}`
}

function parseUserInput(raw: string, min?: string, max?: string): string | undefined {
  const cleaned = raw.replace(/[^0-9/]/g, '')
  const m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return undefined
  const d = Number(m[1])
  const mo = Number(m[2])
  const y = Number(m[3])
  if (mo < 1 || mo > 12) return undefined
  const maxDay = new Date(y, mo, 0).getDate()
  if (d < 1 || d > maxDay) return undefined
  const iso = formatISO(new Date(y, mo - 1, d))
  if (min && iso < min) return undefined
  if (max && iso > max) return undefined
  return iso
}

function formatDateInput(digits: string): string {
  const d = digits.slice(0, 2)
  const m = digits.slice(2, 4)
  const y = digits.slice(4, 8)
  if (digits.length < 3) return d
  if (digits.length < 5) return `${d}/${m}`
  return `${d}/${m}/${y}`
}

function formatMonthInput(digits: string): string {
  const m = digits.slice(0, 2)
  const y = digits.slice(2, 6)
  if (digits.length < 3) return m
  return `${m}/${y}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  const d = new Date(year, month, 1)
  return (d.getDay() + 6) % 7
}

export function DatePicker({
  id,
  label,
  placeholder,
  className,
  value,
  defaultValue,
  onChange,
  error,
  disabled,
  required,
  min,
  max,
  mode = 'date',
  labelClassName,
}: DatePickerProps) {
  const initialValue = value ?? defaultValue
  const minDate = parseDate(min)
  const maxDate = parseDate(max)

  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() })
  const [viewMode, setViewMode] = useState<ViewMode>(mode === 'month' ? 'months' : 'days')
  const [yearPage, setYearPage] = useState(new Date().getFullYear())
  const [inputText, setInputText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [internalValue, setInternalValue] = useState(initialValue ?? '')
  const [pos, setPos] = useState<{ top: number; left: number; dropUp: boolean } | null>(null)

  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const selected = parseDate(internalValue)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const iso = value ?? defaultValue
    if (iso) {
      const d = parseDate(iso)
      if (d) {
        setView({ year: d.getFullYear(), month: d.getMonth() })
        setYearPage(d.getFullYear())
      }
    }
    setViewMode(mode === 'month' ? 'months' : 'days')
  }, [open, value, defaultValue, mode])

  const computePos = useCallback(() => {
    if (!triggerRef.current) return null
    const r = triggerRef.current.getBoundingClientRect()
    const POPUP_H = 340
    const POPUP_W = 290
    const GAP = 4

    const spaceBelow = window.innerHeight - r.bottom
    const dropUp = spaceBelow < POPUP_H && r.top > spaceBelow
    const top = dropUp ? r.top - GAP : r.bottom + GAP

    let left = r.left
    if (left + POPUP_W > window.innerWidth - 8) {
      left = window.innerWidth - POPUP_W - 8
    }
    if (left < 8) left = 8

    return { top, left, dropUp }
  }, [])

  const updatePosition = useCallback(() => {
    if (!open) return
    const p = computePos()
    if (p) setPos(p)
  }, [open, computePos])

  useEffect(() => {
    if (!open) return
    updatePosition()
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    function handleScroll(e: Event) {
      if (popupRef.current?.contains(e.target as Node)) return
      updatePosition()
    }
    function handleResize() {
      updatePosition()
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  function commitValue(iso: string) {
    onChange?.(iso)
    if (!onChange) setInternalValue(iso)
    const d = parseDate(iso)
    if (d) {
      setView({ year: d.getFullYear(), month: d.getMonth() })
      setYearPage(d.getFullYear())
    }
    setViewMode(mode === 'month' ? 'months' : 'days')
  }

  function commitInput() {
    if (mode === 'month') {
      const m = inputText.match(/^(\d{1,2})\/(\d{4})$/)
      if (m) {
        const monthNum = Number(m[1])
        const yearNum = Number(m[2])
        if (monthNum >= 1 && monthNum <= 12) {
          const d = new Date(yearNum, monthNum - 1, 1)
          const iso = formatISO(d)
          const monthDate = new Date(yearNum, monthNum - 1, 1)
          if (!((minDate && monthDate < minDate) || (maxDate && monthDate > maxDate))) {
            commitValue(iso)
            setInputText(formatMonthDisplay(iso))
            setIsEditing(false)
            return
          }
        }
      }
      setInputText(display)
      setIsEditing(false)
      return
    }
    const iso = parseUserInput(inputText, min, max)
    if (iso) {
      commitValue(iso)
      setInputText(formatDisplay(iso))
    } else {
      setInputText(display)
    }
    setIsEditing(false)
  }

  function handleInputKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { commitInput(); setOpen(false) }
    if (e.key === 'Escape') { setInputText(display); setIsEditing(false) }
  }

  const display = mode === 'month' ? formatMonthDisplay(internalValue) : formatDisplay(internalValue)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as Element)?.closest?.('[data-dp-popup]')) {
        setOpen(false)
        setIsEditing(false)
        setViewMode(mode === 'month' ? 'months' : 'days')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mode])

  const today = useMemo(() => new Date(), [])
  const daysInMonth = getDaysInMonth(view.year, view.month)
  const firstDay = getFirstDayOfWeek(view.year, view.month)

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  function pick(d: Date) {
    if (disabled) return
    if (minDate && d < minDate) return
    if (maxDate && d > maxDate) return
    commitValue(formatISO(d))
    setInputText(mode === 'month' ? formatMonthDisplay(formatISO(d)) : formatDisplay(formatISO(d)))
    setIsEditing(false)
    setOpen(false)
  }

  function pickMonth(monthIndex: number) {
    if (disabled) return
    const d = new Date(view.year, monthIndex, 1)
    if (minDate && d < minDate) return
    if (maxDate && d > maxDate) return
    commitValue(formatISO(d))
    setInputText(formatMonthDisplay(formatISO(d)))
    setIsEditing(false)
    setOpen(false)
  }

  function prevMonth() {
    setView((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 })
  }
  function nextMonth() {
    setView((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 })
  }
  function goToday() {
    if (mode === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1)
      commitValue(formatISO(d))
      setInputText(formatMonthDisplay(formatISO(d)))
      setIsEditing(false)
      setOpen(false)
      return
    }
    setView({ year: today.getFullYear(), month: today.getMonth() })
    setViewMode('days')
  }

  function selectMonth(i: number) {
    if (mode === 'month') {
      pickMonth(i)
      return
    }
    setView((v) => ({ year: v.year, month: i }))
    setViewMode('days')
  }
  function selectYear(y: number) {
    setView({ year: y, month: view.month })
    setYearPage(y)
    setViewMode('months')
  }

  const buttonClass = `${className ?? 'w-full'} flex items-center gap-2 border bg-white text-sm
    focus-within:outline-none focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary
    disabled:opacity-50 px-3 py-2 rounded-md
    ${error ? 'border-danger' : 'border-border'}`

  return (
    <div>
      {label && (
        <label htmlFor={id} className={`block ${labelClassName ?? 'text-xs'} font-medium text-text-secondary mb-1`}>
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        {id && <input type="hidden" name={id} value={internalValue} />}

        <div ref={triggerRef} className={buttonClass}>
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={isEditing ? inputText : (display || '')}
            placeholder={placeholder ?? (mode === 'month' ? 'mmm/aaaa' : 'dd/mm/aaaa')}
            disabled={disabled}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, mode === 'date' ? 8 : 6)
              setInputText(mode === 'date' ? formatDateInput(digits) : formatMonthInput(digits))
              setIsEditing(true)
              setOpen(false)
            }}
            onFocus={() => { if (!isEditing) { setInputText(display); setIsEditing(true) }; setOpen(false) }}
            onBlur={commitInput}
            onKeyDown={handleInputKey}
            className="w-full min-w-0 bg-transparent outline-none text-text-primary placeholder-text-tertiary"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              if (disabled) return
              if (!open && selected) {
                setView({ year: selected.getFullYear(), month: selected.getMonth() })
                setYearPage(selected.getFullYear())
              }
              if (!open) setViewMode(mode === 'month' ? 'months' : 'days')
              setOpen(!open)
            }}
            disabled={disabled}
            className="shrink-0 p-0.5 rounded hover:bg-bg-secondary transition-colors"
          >
            <Calendar size={16} className="text-text-tertiary" />
          </button>
        </div>

        {open && pos && mounted &&
          createPortal(
            <div
              ref={popupRef}
              data-dp-popup
              style={{
                position: 'fixed',
                top: pos.dropUp ? 'auto' : pos.top,
                bottom: pos.dropUp ? `calc(100vh - ${pos.top}px)` : 'auto',
                left: pos.left,
              }}
              className="z-[9999]"
            >
              <div className="bg-white border border-border rounded-md shadow-xl p-3 w-72">
                {viewMode === 'days' && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setViewMode('months')} className="text-sm font-medium rounded px-2 py-0.5 text-text-primary hover:bg-bg-secondary transition-colors">
                          {MESES[view.month]}
                        </button>
                        <button type="button" onClick={() => { setYearPage(view.year); setViewMode('years') }} className="text-sm font-medium rounded px-2 py-0.5 text-text-primary hover:bg-bg-secondary transition-colors">
                          {view.year}
                        </button>
                      </div>
                      <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {DIAS.map((d) => (
                        <div key={d} className="text-center text-xs text-text-tertiary font-medium py-1">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((d, i) => {
                        if (!d) return <div key={i} />
                        const isSelected = selected && d.getFullYear() === selected.getFullYear() && d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate()
                        const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
                        const isDisabled = !!(minDate && d < minDate) || !!(maxDate && d > maxDate)
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => pick(d)}
                            className={`h-8 text-sm rounded transition-colors ${
                              isSelected
                                ? 'bg-accent text-white font-medium'
                                : isDisabled
                                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                  : isToday
                                    ? 'border border-accent text-accent font-medium hover:bg-accent-light'
                                    : 'text-text-primary hover:bg-bg-secondary'
                            }`}
                          >
                            {d.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                {viewMode === 'months' && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" onClick={() => setView((v) => ({ ...v, year: v.year - 1 }))} className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <button type="button" onClick={() => setViewMode('years')} className="text-sm font-medium rounded px-2 py-0.5 text-text-primary hover:bg-bg-secondary transition-colors">
                        {view.year}
                      </button>
                      <button type="button" onClick={() => setView((v) => ({ ...v, year: v.year + 1 }))} className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {MESES_CORTO.map((m, i) => {
                        const monthDate = new Date(view.year, i, 1)
                        const monthDisabled = !!(minDate && monthDate < minDate) || !!(maxDate && monthDate > maxDate)
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={monthDisabled}
                            onClick={() => selectMonth(i)}
                            className={`py-2 text-sm rounded transition-colors ${
                              monthDisabled
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : view.month === i && view.year === (selected?.getFullYear() ?? 0)
                                  ? 'bg-accent text-white font-medium'
                                  : 'text-text-primary hover:bg-bg-secondary'
                            }`}
                          >
                            {m}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                {viewMode === 'years' && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" onClick={() => setYearPage((p) => p - 12)} className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-medium text-text-primary">
                        {yearPage - 6} - {yearPage + 5}
                      </span>
                      <button type="button" onClick={() => setYearPage((p) => p + 12)} className="p-1 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => yearPage - 6 + i).map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => selectYear(y)}
                          className={`py-2 text-sm rounded transition-colors ${
                            y === (selected?.getFullYear() ?? 0) ? 'bg-accent text-white font-medium' : 'text-text-primary hover:bg-bg-secondary'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end mt-3 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={goToday}
                    className="text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    Hoy
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  )
}
