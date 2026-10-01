export const APP_TZ = 'America/Argentina/Buenos_Aires'

const pad2 = (n: number): string => String(n).padStart(2, '0')

export function hoyAR(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  hourCycle: 'h23',
})

function parts(d: Date): Record<string, number> {
  const out: Record<string, number> = {}
  for (const p of fmt.formatToParts(d)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value)
  }
  return out
}

export function formatFechaAR(iso: string): string {
  try {
    const p = parts(new Date(iso))
    return `${pad2(p.day)}/${pad2(p.month)}/${p.year}`
  } catch {
    return iso
  }
}

export function formatFechaHoraAR(iso: string): string {
  try {
    const p = parts(new Date(iso))
    return `${pad2(p.day)}/${pad2(p.month)}/${p.year} ${pad2(p.hour)}:${pad2(p.minute)}`
  } catch {
    return iso
  }
}

export function formatFechaLargaAR(isoOrDate: string): string {
  try {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)
    const d = isDateOnly ? new Date(`${isoOrDate}T12:00:00-03:00`) : new Date(isoOrDate)
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: APP_TZ,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(d)
  } catch {
    return isoOrDate
  }
}
