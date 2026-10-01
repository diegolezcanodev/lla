'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

function getPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  let start = Math.max(2, current - 1)
  let end = Math.min(total - 1, current + 1)
  if (current <= 3) end = 4
  if (current >= total - 2) start = total - 3
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push('…')
  pages.push(total)
  return pages
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
}: PaginationProps) {
  const pages = useMemo(() => getPages(page, totalPages), [page, totalPages])

  if (totalPages <= 1 && !pageSize) return null

  const baseBtn = 'inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className={`${baseBtn} text-text-secondary hover:bg-bg-secondary`}
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e-${i}`} className="px-1 text-text-tertiary">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${baseBtn} ${p === page ? 'bg-accent text-white' : 'text-text-secondary hover:bg-bg-secondary'}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          className={`${baseBtn} text-text-secondary hover:bg-bg-secondary`}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {onPageSizeChange && (
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Por página
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-border bg-white px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}