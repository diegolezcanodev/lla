"use client"

import { useState } from "react"
import { CrudFormModal } from "../../../../components/CrudFormModal"
import { InputField } from "../../../../components/InputField"
import { Select } from "../../../../components/Select"
import { createCandidato, updateCandidato } from "../../../../actions/oposicion"
import { createCandidatoSchema, updateCandidatoSchema } from "../../../../lib/validation"
import type { CandidatoResponseDTO, CreateCandidatoDTO, UpdateCandidatoDTO, PartidoResponseDTO, NivelAmenaza } from "../../../../types/oposicion"

interface CandidatoFormModalProps {
  candidato?: CandidatoResponseDTO
  partidos: PartidoResponseDTO[]
  onClose: () => void
  onSuccess: () => void
}

const AMENAZA_OPTIONS = [
  { value: "BAJO", label: "Bajo" },
  { value: "MEDIO", label: "Medio" },
  { value: "ALTO", label: "Alto" },
  { value: "CRITICO", label: "Crítico / Peligroso" },
]

export function CandidatoFormModal({ candidato, partidos, onClose, onSuccess }: CandidatoFormModalProps) {
  const isEdit = !!candidato
  const schema = isEdit ? updateCandidatoSchema : createCandidatoSchema
  const [partidoId, setPartidoId] = useState<string>(candidato?.partidoId ? String(candidato.partidoId) : "")
  const [nivelAmenaza, setNivelAmenaza] = useState<string>(candidato?.nivelAmenaza || "MEDIO")

  async function onSubmitAction(values: Record<string, any>) {
    values.nivelAmenaza = nivelAmenaza
    if (isEdit) {
      return updateCandidato(candidato!.id, values as unknown as UpdateCandidatoDTO)
    }
    return createCandidato(values as unknown as CreateCandidatoDTO)
  }

  const partidoOptions = [
    { value: "", label: "Sin partido / Independiente" },
    ...partidos.map((p) => ({ value: String(p.id), label: p.nombre })),
  ]

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? "Editar candidato" : "Nuevo candidato opositor"}
      subtitle="Cargá información de inteligencia estratégica sobre el contrincante"
      schema={schema}
      submitLabel={isEdit ? "Guardar cambios" : "Crear candidato"}
      successMessage={isEdit ? "Candidato actualizado" : "Candidato creado"}
      onSubmitAction={onSubmitAction}
      className="max-w-xl"
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="nombre"
              label="Nombre *"
              required
              placeholder="Ej: Roberto"
              defaultValue={candidato?.nombre}
              error={fieldErrors?.nombre?.[0]}
            />

            <InputField
              id="apellido"
              label="Apellido *"
              required
              placeholder="Ej: Fernandez"
              defaultValue={candidato?.apellido}
              error={fieldErrors?.apellido?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Select
                id="partidoId"
                name="partidoId"
                label="Partido Político"
                options={partidoOptions}
                value={partidoId}
                onChange={setPartidoId}
                error={fieldErrors?.partidoId?.[0]}
              />
            </div>

            <Select
              id="nivelAmenaza"
              name="nivelAmenaza"
              label="Nivel de Amenaza"
              options={AMENAZA_OPTIONS}
              value={nivelAmenaza}
              onChange={setNivelAmenaza}
              error={fieldErrors?.nivelAmenaza?.[0]}
            />
          </div>

          <InputField
            id="cargo"
            label="Cargo al que postula o Rol"
            placeholder="Ej: Candidato a Intendente, 1er Concejal"
            defaultValue={candidato?.cargo ?? ""}
            error={fieldErrors?.cargo?.[0]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="telefono"
              label="Teléfono"
              placeholder="Ej: 341-9998888"
              defaultValue={candidato?.telefono ?? ""}
              error={fieldErrors?.telefono?.[0]}
            />

            <InputField
              id="instagram"
              label="Instagram"
              placeholder="@candidato"
              defaultValue={candidato?.instagram ?? ""}
              error={fieldErrors?.instagram?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="fortalezas"
              label="Fortalezas / Puntos fuertes"
              placeholder="Carisma, apoyo de empresarios, aparato municipal..."
              defaultValue={candidato?.fortalezas ?? ""}
              error={fieldErrors?.fortalezas?.[0]}
            />

            <InputField
              id="debilidades"
              label="Debilidades / Flancos débiles"
              placeholder="Denuncias, división interna en su partido, falta de presencia en zona sur..."
              defaultValue={candidato?.debilidades ?? ""}
              error={fieldErrors?.debilidades?.[0]}
            />
          </div>

          <InputField
            id="infoEstrategica"
            label="Información Estratégica & Análisis"
            placeholder="Estrategia discursiva que usa, con quién polariza, financiamiento..."
            defaultValue={candidato?.infoEstrategica ?? ""}
            error={fieldErrors?.infoEstrategica?.[0]}
          />
        </>
      )}
    </CrudFormModal>
  )
}
