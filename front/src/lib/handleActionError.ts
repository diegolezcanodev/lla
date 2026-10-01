'use client'

import { toast } from 'sonner'

interface ErrorResult {
  status?: number
  error?: string
  fieldErrors?: Record<string, string[]>
}

export function handleActionError(result: ErrorResult): Record<string, string[]> | null {
  if (result.fieldErrors) {
    if (result.status === 409 && result.error) {
      toast.warning(result.error)
    }
    return result.fieldErrors
  }

  const status = result.status ?? 0
  const error = result.error || 'Ocurrió un error inesperado'

  if (status === 401) {
    toast.error('Sesión expirada. Ingresá nuevamente.')
    if (typeof window !== 'undefined') window.location.href = '/'
    return null
  } else if (status === 403) {
    toast.error('No tenés permisos para realizar esta acción')
  } else if (status === 404) {
    toast.error(error)
  } else if (status === 409) {
    toast.warning(error)
  } else if (status >= 500) {
    toast.error('Error interno del servidor')
  } else {
    toast.error(error || 'Error de conexión con el servidor')
  }

  return null
}
