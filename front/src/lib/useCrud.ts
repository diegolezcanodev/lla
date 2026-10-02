'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { PaginatedResponse } from '../types/pagination'
import { writePageSizeCookie } from './pageSizeCookie'
import { revalidateRoute } from '../actions/revalidate'

interface UseCrudOptions<T> {
  fetchFn: (page: number, pageSize: number, search?: string) => Promise<PaginatedResponse<T>>
  initialData: PaginatedResponse<T>
  defaultPageSize?: number
  storageKey?: string
  routePath?: string
}

export interface CrudState<T> {
  data: T[]
  page: number
  totalPages: number
  pageSize: number
  loading: boolean
  showModal: boolean
  selectedItem: T | null
  search: string
  setSearch: (search: string) => void
  setPageSize: (size: number) => void
  refreshData: (targetPage?: number, targetPageSize?: number, silent?: boolean) => Promise<void>
  handlePageChange: (newPage: number) => void
  handleEdit: (item: T) => void
  handleCreate: () => void
  handleClose: () => void
}

export function useCrud<T>({
  fetchFn,
  initialData,
  defaultPageSize = 12,
  storageKey,
  routePath,
}: UseCrudOptions<T>): CrudState<T> {
  const [data, setData] = useState<T[]>(initialData.data)
  const [page, setPage] = useState(initialData.page)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)
  const [pageSize, setPageSizeState] = useState(initialData.limit || defaultPageSize)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [search, setSearchState] = useState('')
  const searchRef = useRef('')
  const initialSyncDone = useRef(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const refreshData = useCallback(
    async (targetPage?: number, targetPageSize?: number, silent = false) => {
      if (!silent) setLoading(true)
      try {
        const targetP = targetPage ?? page
        const targetS = targetPageSize ?? pageSize
        const result = await fetchFn(targetP, targetS, searchRef.current)
        setData(result.data)
        setPage(result.page)
        setTotalPages(result.totalPages)
      } catch {
        toast.error('Error al cargar los datos. Intentá de nuevo.')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [page, pageSize, fetchFn]
  )

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
    searchRef.current = value
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => refreshData(1), 300)
  }, [refreshData])

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === page || loading) return
      refreshData(newPage)
    },
    [page, loading, refreshData]
  )

  function handleEdit(item: T) {
    setSelectedItem(item)
    setShowModal(true)
  }

  function handleCreate() {
    setSelectedItem(null)
    setShowModal(true)
  }

  function handleClose() {
    setSelectedItem(null)
    setShowModal(false)
  }

  function setPageSize(size: number) {
    setPageSizeState(size)
    if (storageKey) writePageSizeCookie(storageKey, size)
    if (routePath) revalidateRoute(routePath)
    refreshData(1, size)
  }

  useEffect(() => {
    if (initialSyncDone.current) return
    initialSyncDone.current = true
    if (pageSize !== initialData.limit) {
      refreshData(1, undefined, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    data,
    page,
    totalPages,
    pageSize,
    loading,
    showModal,
    selectedItem,
    search,
    setSearch,
    setPageSize,
    refreshData,
    handlePageChange,
    handleEdit,
    handleCreate,
    handleClose,
  }
}
