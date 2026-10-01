import { ApiError } from './apiClient'

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; code?: string; fieldErrors?: Record<string, string[]> }

export function actionError(err: unknown): ActionResult<never> {
  const status = isApiError(err) ? err.status : 0
  const message = isApiError(err) ? err.message : 'Error de conexión con el servidor'
  const details = isApiError(err) ? err.details : undefined
  const code = isApiError(err) ? err.code : undefined

  if (status && details) {
    const fieldErrors = parseFieldErrors(details)
    return {
      ok: false,
      status,
      error: message || (fieldErrors ? 'Error de validación' : 'Error en la solicitud'),
      code,
      fieldErrors: fieldErrors ?? undefined,
    }
  }

  return { ok: false, status, error: message, code }
}

function isApiError(err: unknown): err is ApiError {
  return !!err && typeof err === 'object' && 'status' in err && 'message' in err
}

function parseFieldErrors(details: unknown): Record<string, string[]> | null {
  if (!details) return null
  const d = details as { nested?: Record<string, string[]> }
  if (!d.nested) return null
  const result: Record<string, string[]> = {}
  for (const key in d.nested) {
    if (d.nested[key]) result[key] = [...d.nested[key]]
  }
  return Object.keys(result).length > 0 ? result : null
}
