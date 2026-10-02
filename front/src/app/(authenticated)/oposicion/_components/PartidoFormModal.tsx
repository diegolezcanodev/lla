"use client"

import { useState } from "react"
import { CrudFormModal } from "../../../../components/CrudFormModal"
import { InputField } from "../../../../components/InputField"
import { createPartido, updatePartido } from "../../../../actions/oposicion"
import { createPartidoSchema, updatePartidoSchema } from "../../../../lib/validation"
import type { PartidoResponseDTO, CreatePartidoDTO, UpdatePartidoDTO } from "../../../../types/oposicion"

interface PartidoFormModalProps {
  partido?: PartidoResponseDTO
  onClose: () => void
  onSuccess: () => void
}

export function PartidoFormModal({ partido, onClose, onSuccess }: PartidoFormModalProps) {
  const isEdit = !!partido
  const schema = isEdit ? updatePartidoSchema : createPartidoSchema
  const [color, setColor] = useState<string>(partido?.color || "#3B82F6")

  async function onSubmitAction(values: Record<string, any>) {
    values.color = color
    if (isEdit) {
      return updatePartido(partido!.id, values as unknown as UpdatePartidoDTO)
    }
    return createPartido(values as unknown as CreatePartidoDTO)
  }

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? "Editar partido" : "Nuevo partido opositor"}
      subtitle="Definí el espacio o frente político adverso"
      schema={schema}
      submitLabel={isEdit ? "Guardar cambios" : "Crear partido"}
      successMessage={isEdit ? "Partido actualizado" : "Partido creado"}
      onSubmitAction={onSubmitAction}
      className="max-w-lg"
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <InputField
                id="nombre"
                label="Nombre del Partido *"
                required
                placeholder="Ej: Unión Vecinal"
                defaultValue={partido?.nombre}
                error={fieldErrors?.nombre?.[0]}
              />
            </div>
            <InputField
              id="sigla"
              label="Sigla"
              placeholder="Ej: UV"
              defaultValue={partido?.sigla ?? ""}
              error={fieldErrors?.sigla?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="referenteNombre"
              label="Presidente / Referente"
              placeholder="Nombre del apoderado o líder"
              defaultValue={partido?.referenteNombre ?? ""}
              error={fieldErrors?.referenteNombre?.[0]}
            />

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-text-secondary mb-1.5">
                Color Identificatorio
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
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>

          <InputField
            id="observaciones"
            label="Notas y análisis estratégico"
            placeholder="Intención de voto estimada, acuerdos con otros partidos, etc."
            defaultValue={partido?.observaciones ?? ""}
            error={fieldErrors?.observaciones?.[0]}
          />
        </>
      )}
    </CrudFormModal>
  )
}
