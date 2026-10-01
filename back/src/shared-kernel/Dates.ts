// =====================================================================
// Convención horaria global: America/Argentina/Buenos_Aires (UTC-3 fijo, sin DST)
// =====================================================================

export const APP_TZ = 'America/Argentina/Buenos_Aires'

let clock: () => Date = () => new Date()

export function setClockForTests(fn: () => Date): void {
  clock = fn
}

export function ahoraAR(): Date {
  return clock()
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

function arParts(d: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value)
  return { y: get('year'), m: get('month'), d: get('day') }
}

export function getARDates(d: Date): { y: number; m: number; d: number } {
  return arParts(d)
}

export function hoyAR(): string {
  const { y, m, d } = arParts(clock())
  return `${y}-${pad2(m)}-${pad2(d)}`
}

export function mesKeyOfInstant(d: Date): string {
  const { y, m } = arParts(d)
  return `${y}-${pad2(m)}`
}

export function dateKeyOfInstant(d: Date): string {
  const { y, m, d: day } = arParts(d)
  return `${y}-${pad2(m)}-${pad2(day)}`
}

export function dateKeyOfDateColumn(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function dateMonthKeyOfDateColumn(d: Date): string {
  return d.toISOString().slice(0, 7)
}

export function parseARDate(iso: string): Date {
  return new Date(`${iso}T00:00:00-03:00`)
}

export function parseARDateTime(value: string): Date {
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) return new Date(value)
  return new Date(`${value}-03:00`)
}

export function dateOnlyForDb(d: Date): Date {
  const { y, m, d: day } = arParts(d)
  return parseARDate(`${y}-${pad2(m)}-${pad2(day)}`)
}

export function mesSiguiente(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const anio = m === 12 ? y + 1 : y
  const mes = m === 12 ? 1 : m + 1
  return `${anio}-${String(mes).padStart(2, '0')}`
}

export function rangoSemanaAR(refIso?: string): { desde: string; hasta: string } {
  const iso = refIso && /^\d{4}-\d{2}-\d{2}$/.test(refIso) ? refIso : hoyAR()
  const d = parseARDate(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TZ,
    weekday: 'short',
  }).format(d)

  const mapDay: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  }
  const dayOffset = mapDay[parts] ?? 0

  const mondayMs = d.getTime() - dayOffset * 86400000
  const sundayMs = mondayMs + 6 * 86400000

  const lunes = new Date(mondayMs)
  const domingo = new Date(sundayMs)

  return {
    desde: dateKeyOfInstant(lunes),
    hasta: dateKeyOfInstant(domingo),
  }
}
