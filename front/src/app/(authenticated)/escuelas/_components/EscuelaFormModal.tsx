"use client"

import { useEffect, useState } from "react"
import { CrudFormModal } from "../../../../components/CrudFormModal"
import { InputField } from "../../../../components/InputField"
import { Select } from "../../../../components/Select"
import { createEscuela, updateEscuela } from "../../../../actions/escuela"
import { getAllBarriosActivos } from "../../../../services/barrios"
import { createEscuelaSchema, updateEscuelaSchema } from "../../../../lib/validation"
import type { EscuelaResponseDTO, CreateEscuelaDTO, UpdateEscuelaDTO, NivelEducativo } from "../../../../types/escuela"
import type { BarrioResponseDTO } from "../../../../types/barrio"

interface EscuelaFormModalProps {
  escuela?: EscuelaResponseDTO
  onClose: () => void
  onSuccess: () => void
}

const NIVEL_OPTIONS = [
  { value: "INICIAL", label: "Inicial / Jardín" },
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" },
  { value: "TERCIARIA", label: "Terciaria / Superior" },
  { value: "UNIVERSITARIA", label: "Universitaria" },
  { value: "ESPECIAL", label: "Educación Especial" },
]

export function EscuelaFormModal({ escuela, onClose, onSuccess }: EscuelaFormModalProps) {
  const isEdit = !!escuela
  const schema = isEdit ? updateEscuelaSchema : createEscuelaSchema
  const [barrios, setBarrios] = useState<BarrioResponseDTO[]>([])
  const [barrioId, setBarrioId] = useState<string>(escuela?.barrioId ? String(escuela.barrioId) : "")
  const [nivel, setNivel] = useState<string>(escuela?.nivel || "PRIMARIA")

  useEffect(() => {
    getAllBarriosActivos().then(setBarrios).catch(() => {})
  }, [])

  async function onSubmitAction(values: Record<string, any>) {
    values.nivel = nivel
    if (isEdit) {
      return updateEscuela(escuela!.id, values as unknown as UpdateEscuelaDTO)
    }
    return createEscuela(values as unknown as CreateEscuelaDTO)
  }

  const barrioOptions = [
    { value: "", label: "Sin barrio asignado" },
    ...barrios.map((b) => ({ value: String(b.id), label: b.nombre })),
  ]

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? "Editar escuela" : "Nueva escuela"}
      subtitle="Registrá los datos institucionales y de contacto del establecimiento"
      schema={schema}
      submitLabel={isEdit ? "Guardar cambios" : "Crear escuela"}
      successMessage={isEdit ? "Escuela actualizada" : "Escuela creada"}
      onSubmitAction={onSubmitAction}
      className="max-w-xl"
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <InputField
                id="nombre"
                label="Nombre de la Institución *"
                required
                placeholder="Ej: Colegio San José"
                defaultValue={escuela?.nombre}
                error={fieldErrors?.nombre?.[0]}
              />
            </div>
            <InputField
              id="numero"
              type="number"
              label="Número (opcional)"
              placeholder="Ej: 432"
              defaultValue={escuela?.numero ? String(escuela.numero) : ""}
              error={fieldErrors?.numero?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="nivel"
              name="nivel"
              label="Nivel Educativo *"
              options={NIVEL_OPTIONS}
              value={nivel}
              onChange={setNivel}
              error={fieldErrors?.nivel?.[0]}
            />

            <InputField
              id="modalidad"
              label="Modalidad / Orientación"
              placeholder="Ej: Técnica, Bachiller, Bilingüe"
              defaultValue={escuela?.modalidad ?? ""}
              error={fieldErrors?.modalidad?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="direccion"
              label="Dirección"
              placeholder="Ej: Mitre 540"
              defaultValue={escuela?.direccion ?? ""}
              error={fieldErrors?.direccion?.[0]}
            />

            <Select
              id="barrioId"
              name="barrioId"
              label="Barrio / Zona"
              options={barrioOptions}
              value={barrioId}
              onChange={setBarrioId}
              error={fieldErrors?.barrioId?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              id="director"
              label="Director/a (opcional)"
              placeholder="Nombre y apellido"
              defaultValue={escuela?.director ?? ""}
              error={fieldErrors?.director?.[0]}
            />

            <InputField
              id="telefonoDirector"
              label="Teléfono Directivo"
              placeholder="Ej: 341-4445555"
              defaultValue={escuela?.telefonoDirector ?? ""}
              error={fieldErrors?.telefonoDirector?.[0]}
            />

            <InputField
              id="emailDirector"
              label="Email Directivo"
              placeholder="direccion@escuela.edu.ar"
              defaultValue={escuela?.emailDirector ?? ""}
              error={fieldErrors?.emailDirector?.[0]}
            />
          </div>

          <div>
            <InputField
              id="observaciones"
              label="Observaciones"
              placeholder="Infraestructura, comedor, cooperadora..."
              defaultValue={escuela?.observaciones ?? ""}
              error={fieldErrors?.observaciones?.[0]}
            />
          </div>
        </>
      )}
    </CrudFormModal>
  )
}
