'use client'

import { FormEvent, ReactNode, useState } from 'react'
import { safeParse, flatten } from 'valibot'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { AsyncButton } from './AsyncButton'
import { SmoothHeight } from './SmoothHeight'
import { ModalOverlay } from './ModalOverlay'
import { handleActionError } from '../lib/handleActionError'
import type { ActionResult } from '../lib/actionResult'

interface CrudFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void | Promise<void>
  title: string
  subtitle?: string
  schema: any
  submitLabel?: string
  successMessage: string
  onSubmitAction: (values: Record<string, any>) => Promise<ActionResult<any>>
  className?: string
  hideFooter?: boolean
  children: (props: {
    fieldErrors: Record<string, string[]> | null
    loading: boolean
    onClose: () => void
  }) => ReactNode
}

function formToValues(form: FormData): Record<string, any> {
  const values: Record<string, any> = {}
  form.forEach((v, k) => {
    const value = v as string
    if (k in values) {
      values[k] = Array.isArray(values[k]) ? [...values[k], value] : [values[k], value]
    } else {
      values[k] = value
    }
  })
  return values
}

export function CrudFormModal({
  open,
  onClose,
  onSuccess,
  title,
  subtitle,
  schema,
  submitLabel = 'Guardar',
  successMessage,
  onSubmitAction,
  className = '',
  hideFooter = false,
  children,
}: CrudFormModalProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const values = formToValues(form)

    const parsed = safeParse(schema, values)
    if (!parsed.success) {
      const nested = flatten(parsed.issues).nested as Record<string, string[]>
      setFieldErrors(nested ?? {})
      setLoading(false)
      return
    }

    try {
      const result = await onSubmitAction(parsed.output)
      if (!result.ok) {
        const errors = handleActionError(result)
        if (errors) {
          setFieldErrors(errors)
        } else if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        } else if (result.error) {
          toast.error(result.error)
        }
        return
      }

      await onSuccess()
      onClose()
      toast.success(successMessage)
    } catch {
      toast.error('Ocurrió un error inesperado. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div
        className={`relative w-full max-w-lg rounded-2xl bg-white border border-border shadow-2xl animate-card-in overflow-hidden z-10 flex flex-col max-h-[90vh] ${className}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-secondary/40">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={loading}
            className="p-1.5 rounded-md text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <SmoothHeight>
              <div className="space-y-4">
                {children({ fieldErrors, loading, onClose })}
              </div>
            </SmoothHeight>
          </div>

          {!hideFooter && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-bg-secondary/40">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <AsyncButton type="submit" loading={loading} size="md" className="px-5 py-2 text-sm">
                {submitLabel}
              </AsyncButton>
            </div>
          )}
        </form>
      </div>
    </ModalOverlay>
  )
}