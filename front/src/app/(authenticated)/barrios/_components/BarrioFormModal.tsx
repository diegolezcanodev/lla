'use client'

import { useState } from 'react'
import { CrudFormModal } from '../../../../components/CrudFormModal'
import { InputField } from '../../../../components/InputField'
import { Select } from '../../../../components/Select'
import { Toggle } from '../../../../components/Toggle'
import { createBarrio, updateBarrio } from '../../../../actions/barrio'
import { createBarrioSchema, updateBarrioSchema } from '../../../../lib/validation'
import type {
  BarrioResponseDTO,
  CreateBarrioDTO,
  UpdateBarrioDTO,
  PrioridadBarrio,
} from '../../../../types/barrio'

interface BarrioFormModalProps {
  barrio?: BarrioResponseDTO
  onClose: () => void
  onSuccess: () => void
}

const PRIORIDAD_OPTIONS = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'EN_DISPUTA', label: 'En disputa' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
]

export function BarrioFormModal({ barrio, onClose, onSuccess }: BarrioFormModalProps) {
  const isEdit = !!barrio
  const schema = isEdit ? updateBarrioSchema : createBarrioSchema
  const [prioridad, setPrioridad] = useState<PrioridadBarrio>(barrio?.prioridad ?? 'MEDIA')
  const [color, setColor] = useState<string>(barrio?.color ?? '#6D28D9')

  async function onSubmitAction(values: Record<string, any>) {
    if (isEdit) {
      return updateBarrio(barrio!.id, values as unknown as UpdateBarrioDTO)
    }
    return createBarrio(values as unknown as CreateBarrioDTO)
  }

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? 'Editar barrio' : 'Nuevo barrio'}
      subtitle="Definí las características territoriales, código y prioridad política"
      schema={schema}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear barrio'}
      successMessage={isEdit ? 'Barrio actualizado' : 'Barrio creado'}
      onSubmitAction={onSubmitAction}
      className="max-w-xl"
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <InputField
                id="nombre"
                label="Nombre del Barrio"
                required
                placeholder="Ej: Palermo, Recoleta, Parque Patricios..."
                defaultValue={barrio?.nombre}
                error={fieldErrors?.nombre?.[0]}
              />
            </div>
            <InputField
              id="codigo"
              label="Código (3 letras)"
              placeholder="Ej: PAL"
              maxLength={3}
              defaultValue={barrio?.codigo ?? ''}
              error={fieldErrors?.codigo?.[0]}
              className="uppercase font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="prioridad"
              name="prioridad"
              label="Prioridad Territorial"
              options={PRIORIDAD_OPTIONS}
              value={prioridad}
              onChange={(v) => setPrioridad(v as PrioridadBarrio)}
              error={fieldErrors?.prioridad?.[0]}
            />

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-text-secondary mb-1.5">
                Color de Identificación
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 p-1 rounded-lg border border-border cursor-pointer bg-white"
                />
                <input
                  id="color"
                  type="text"
                  name="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-md border border-border font-mono text-text-primary uppercase"
                  placeholder="#6D28D9"
                />
              </div>
            </div>
          </div>

          <InputField
            id="tags"
            label="Tags o Etiquetas (separados por coma)"
            placeholder="Ej: industrial, comercial, gastronómico, residencial"
            defaultValue={barrio?.tags ? barrio.tags.join(', ') : ''}
            error={fieldErrors?.tags?.[0]}
          />

          <InputField
            id="descripcion"
            label="Descripción o Característica principal"
            placeholder="Ej: Zona con fuerte concentración comercial y alta afluencia..."
            defaultValue={barrio?.descripcion ?? ''}
            error={fieldErrors?.descripcion?.[0]}
          />

          <InputField
            id="observaciones"
            label="Observaciones o Notas internas"
            placeholder="Notas del equipo, contactos clave, historial..."
            defaultValue={barrio?.observaciones ?? ''}
            error={fieldErrors?.observaciones?.[0]}
          />

          {isEdit && <EstadoField initial={barrio?.activo ?? true} />}
        </>
      )}
    </CrudFormModal>
  )
}

function EstadoField({ initial }: { initial: boolean }) {
  const [activo, setActivo] = useState(initial)
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-text-secondary">Estado del barrio</p>
        <p className="text-xs text-text-tertiary">Los barrios inactivos no se muestran para nuevos miembros</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">{activo ? 'Activo' : 'Inactivo'}</span>
        <input type="hidden" name="activo" value={String(activo)} />
        <Toggle checked={activo} onChange={setActivo} label="Estado del barrio" />
      </div>
    </div>
  )
}
