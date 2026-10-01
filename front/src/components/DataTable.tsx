'use client'

import { useMemo, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Search, Trash2, X } from 'lucide-react'
import { Select } from './Select'
import { useDelayedFlag } from '../lib/useDelayedFlag'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
  hideOnMobile?: boolean
  width?: string
}

export interface DataTableFilter {
  key: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  loading?: boolean
  emptyMessage?: string
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  searchFilter?: (item: T, search: string) => boolean
  filters?: DataTableFilter[]
  serverSideFilters?: boolean
  filterExtra?: ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  renderActions?: (item: T) => ReactNode
  renderCard?: (item: T) => ReactNode
  rowClassName?: (item: T) => string
  skeletonRows?: number
  serverSideSearch?: boolean
  actionsWidth?: string
  actionsIconCount?: number
  tableMinWidth?: string
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TableSkeleton({ rows = 5, columns }: { rows: number; columns: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="py-3 px-4">
              <div
                className="h-4 rounded bg-bg-secondary animate-pulse"
                style={{ width: `${40 + ((i + j) % 4) * 15}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white border border-border rounded-lg space-y-2">
          <div className="h-4 w-2/3 rounded bg-bg-secondary animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-bg-secondary animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-bg-secondary animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ─── Pagination ──────────────────────────────────────────────────────────────

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions: number[]
  loading?: boolean
}

function TablePagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  loading,
}: TablePaginationProps) {
  function getPages(): (number | '...')[] {
    const pages: (number | '...')[] = []
    const delta = 1
    pages.push(1)
    if (page - delta > 2) pages.push('...')
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      pages.push(i)
    }
    if (page + delta < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  const currentSize = pageSizeOptions.includes(pageSize) ? pageSize : 10

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2 text-sm text-text-secondary whitespace-nowrap">
        <span>Mostrar</span>
        <Select
          dropUp
          centerOptions
          options={pageSizeOptions.map((s) => ({ value: String(s), label: String(s) }))}
          value={String(currentSize)}
          onChange={(v) => onPageSizeChange?.(Number(v))}
          disabled={loading || !onPageSizeChange}
          className="w-20"
        />
        <span>por página</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-text-tertiary select-none">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p)}
              disabled={loading}
              className={`min-w-[36px] h-9 rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-bg-secondary'
              } disabled:opacity-50`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

// ─── Main DataTable ──────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  page = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  searchFilter,
  filters,
  serverSideFilters,
  filterExtra,
  onEdit,
  onDelete,
  renderActions,
  renderCard,
  rowClassName,
  skeletonRows,
  serverSideSearch,
  actionsWidth,
  actionsIconCount,
  tableMinWidth,
}: DataTableProps<T>) {
  const computedActionsWidth =
    actionsWidth ??
    (typeof actionsIconCount === 'number'
      ? `${36 * actionsIconCount + 28}px`
      : !renderActions
      ? `${36 * ((onEdit ? 1 : 0) + (onDelete ? 1 : 0)) + 28}px`
      : `${36 * 2 + 28}px`)

  const effectiveSkeletonRows = skeletonRows ?? Math.min(pageSize ?? 10, 6)
  const showOverlay = useDelayedFlag(!!(loading && data.length > 0), 180)

  const filteredData = useMemo(() => {
    let result = data

    if (!serverSideSearch && search) {
      const q = search.toLowerCase()
      result = result.filter((item) => {
        if (searchFilter) return searchFilter(item, search)
        return JSON.stringify(item).toLowerCase().includes(q)
      })
    }

    if (filters && !serverSideFilters) {
      for (const filter of filters) {
        if (filter.value) {
          result = result.filter((item) => {
            const val = item[filter.key as keyof T]
            if (val === undefined) return true
            return String(val) === filter.value
          })
        }
      }
    }

    return result
  }, [data, search, searchFilter, serverSideSearch, serverSideFilters, filters])

  const showPagination = onPageChange != null

  return (
    <div className="bg-white border border-border rounded-xl shadow-xs flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Search + Filters bar */}
      {(onSearchChange || (filters && filters.length > 0) || filterExtra) && (
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border flex-wrap shrink-0 bg-white">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {onSearchChange && (
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                />
                <input
                  type="text"
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-8 py-2 rounded-md border border-border bg-white text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors shadow-xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5"
                    title="Limpiar búsqueda"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
            {filters?.map((filter) => (
              <Select
                key={filter.key}
                options={filter.options}
                value={filter.value}
                onChange={filter.onChange}
                className={filter.className}
              />
            ))}
          </div>
          {filterExtra && <div className="shrink-0">{filterExtra}</div>}
        </div>
      )}

      {/* Scrollable body wrapper */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* Loading overlay */}
        {showOverlay && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none transition-opacity duration-200">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
          </div>
        )}

        {/* Scrollable body */}
        <div className="h-full overflow-y-auto custom-scroll flex-1">
          {/* Mobile cards */}
          <div className="block md:hidden p-4">
            {loading && filteredData.length === 0 ? (
              <CardSkeleton count={effectiveSkeletonRows} />
            ) : filteredData.length === 0 ? (
              <p className="text-sm text-text-tertiary py-8 text-center">
                {search ? 'No se encontraron resultados' : emptyMessage}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredData.map((item) =>
                  renderCard ? (
                    renderCard(item)
                  ) : (
                    <DataTableMobileCard
                      key={keyExtractor(item)}
                      item={item}
                      columns={columns}
                      onEdit={onEdit ? () => onEdit(item) : undefined}
                      onDelete={onDelete ? () => onDelete(item) : undefined}
                      renderActions={renderActions ? () => renderActions(item) : undefined}
                      rowClassName={rowClassName ? rowClassName(item) : undefined}
                    />
                  ),
                )}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto custom-scroll">
            <table
              className="w-full table-auto"
              style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
            >
              <thead className="bg-bg-secondary/60 text-text-secondary text-xs uppercase font-medium border-b border-border sticky top-0 z-[5]">
                <tr className="whitespace-nowrap">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-left py-3 px-4 ${col.className ?? ''}`}
                      style={col.width ? { minWidth: col.width } : undefined}
                    >
                      {col.header}
                    </th>
                  ))}
                  {(onEdit || onDelete || renderActions) && (
                    <th
                      className="text-right py-3 px-4 whitespace-nowrap w-px"
                      style={{ minWidth: computedActionsWidth }}
                    >
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              {loading && filteredData.length === 0 ? (
                <TableSkeleton
                  rows={effectiveSkeletonRows}
                  columns={columns.length + (onEdit || onDelete || renderActions ? 1 : 0)}
                />
              ) : filteredData.length === 0 ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={columns.length + (onEdit || onDelete || renderActions ? 1 : 0)}
                      className="text-sm text-text-tertiary py-12 text-center"
                    >
                      {search ? 'No se encontraron resultados' : emptyMessage}
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-border text-text-primary">
                  {filteredData.map((item, index) => {
                    const customRow = rowClassName ? rowClassName(item) : ''
                    const zebra = index % 2 === 1 ? 'bg-bg-secondary/20' : 'bg-white'
                    const hover = customRow ? 'hover:brightness-95' : 'hover:bg-bg-secondary/40'
                    return (
                      <tr
                        key={keyExtractor(item)}
                        className={`transition-colors ${hover} ${zebra} ${customRow}`}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={`py-3.5 px-4 text-sm ${col.className ?? ''}`}
                            style={col.width ? { minWidth: col.width } : undefined}
                          >
                            {col.render(item)}
                          </td>
                        ))}
                        {(onEdit || onDelete || renderActions) && (
                          <td
                            className="py-3.5 px-4 text-right align-middle whitespace-nowrap w-px"
                            style={{ minWidth: computedActionsWidth }}
                          >
                            {renderActions ? (
                              renderActions(item)
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {onEdit && (
                                  <button
                                    type="button"
                                    onClick={() => onEdit(item)}
                                    className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                                    aria-label="Editar"
                                    title="Editar"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                )}
                                {onDelete && (
                                  <button
                                    type="button"
                                    onClick={() => onDelete(item)}
                                    className="p-1.5 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
                                    aria-label="Eliminar"
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Pinned Pagination Footer */}
      {showPagination && (
        <div className="border-t border-border px-4 py-3 shrink-0 bg-white">
          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}

// ─── Mobile Card ─────────────────────────────────────────────────────────────

interface MobileCardProps<T> {
  item: T
  columns: DataTableColumn<T>[]
  onEdit?: () => void
  onDelete?: () => void
  renderActions?: () => ReactNode
  rowClassName?: string
}

function DataTableMobileCard<T>({
  item,
  columns,
  onEdit,
  onDelete,
  renderActions,
  rowClassName,
}: MobileCardProps<T>) {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-xs transition-all ${
        rowClassName ?? ''
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        {columns
          .filter((col) => !col.hideOnMobile)
          .slice(0, 3)
          .map((col) => (
            <div key={col.key} className="text-sm">
              {col.render(item)}
            </div>
          ))}
      </div>
      {renderActions ? (
        <div className="shrink-0 ml-4">{renderActions()}</div>
      ) : (
        (onEdit || onDelete) && (
          <div className="flex items-center gap-1 shrink-0 ml-4">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                aria-label="Editar"
              >
                <Pencil size={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )
      )}
    </div>
  )
}