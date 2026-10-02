"use client"

import { useEffect, useState, useRef } from "react"
import { CrudFormModal } from "../../../../components/CrudFormModal"
import { InputField } from "../../../../components/InputField"
import { TextareaField } from "../../../../components/TextareaField"
import { Select } from "../../../../components/Select"
import { createTarea, updateTarea } from "../../../../actions/tarea"
import { getAllBarriosActivos } from "../../../../services/barrios"
import { getEquipo } from "../../../../services/equipo"
import { createTareaSchema, updateTareaSchema } from "../../../../lib/validation"
import type { TareaResponseDTO, CreateTareaDTO, UpdateTareaDTO, TareaAsignadoDTO } from "../../../../types/tarea"
import type { BarrioResponseDTO } from "../../../../types/barrio"
import type { MiembroEquipoResponseDTO } from "../../../../types/equipo"
import { Search, User, X, Loader2 } from "lucide-react"

interface TareaFormModalProps {
  tarea?: TareaResponseDTO
  onClose: () => void
  onSuccess: () => void
}

const ESTADO_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROGRESO", label: "En Progreso" },
  { value: "EN_REVISION", label: "En Revisión" },
  { value: "COMPLETADA", label: "Completada" },
  { value: "CANCELADA", label: "Cancelada" },
]

const PRIORIDAD_OPTIONS = [
  { value: "BAJA", label: "Baja" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
  { value: "URGENTE", label: "Urgente" },
]

export function TareaFormModal({ tarea, onClose, onSuccess }: TareaFormModalProps) {
  const isEdit = !!tarea
  const schema = isEdit ? updateTareaSchema : createTareaSchema
  const [barrios, setBarrios] = useState<BarrioResponseDTO[]>([])
  const [barrioId, setBarrioId] = useState<string>(tarea?.barrioId ? String(tarea.barrioId) : "")
  const [estado, setEstado] = useState<string>(tarea?.estado || "PENDIENTE")
  const [prioridad, setPrioridad] = useState<string>(tarea?.prioridad || "MEDIA")

  // Multi-assign state
  const [selectedMiembros, setSelectedMiembros] = useState<TareaAsignadoDTO[]>(
    tarea?.asignados || []
  )
  const [memberSearch, setMemberSearch] = useState("")
  const [searchResults, setSearchResults] = useState<MiembroEquipoResponseDTO[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    getAllBarriosActivos().then(setBarrios).catch(() => {})
  }, [])

  // Live search when typing >= 3 chars
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    const query = memberSearch.trim()
    if (query.length < 3) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await getEquipo(1, 10, query)
        setSearchResults(res.data)
        setShowDropdown(true)
      } catch (err) {
        console.error("Error buscando miembros de equipo:", err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [memberSearch])

  const handleAddMember = (m: MiembroEquipoResponseDTO) => {
    if (!selectedMiembros.some((sm) => sm.id === m.id)) {
      setSelectedMiembros([...selectedMiembros, { id: m.id, nombre: m.nombre, apellido: m.apellido }])
    }
    setMemberSearch("")
    setShowDropdown(false)
  }

  const handleRemoveMember = (id: number) => {
    setSelectedMiembros(selectedMiembros.filter((m) => m.id !== id))
  }

  async function onSubmitAction(values: Record<string, any>) {
    values.estado = estado
    values.prioridad = prioridad
    values.asignadosIds = selectedMiembros.map((m) => m.id)
    if (isEdit) {
      return updateTarea(tarea!.id, values as unknown as UpdateTareaDTO)
    }
    return createTarea(values as unknown as CreateTareaDTO)
  }

  const barrioOptions = [
    { value: "", label: "General / Sin barrio específico" },
    ...barrios.map((b) => ({ value: String(b.id), label: b.nombre })),
  ]

  return (
    <CrudFormModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      title={isEdit ? "Editar tarea" : "Nueva tarea o ticket"}
      subtitle="Definí objetivos claros para el equipo territorial y de campaña"
      schema={schema}
      submitLabel={isEdit ? "Guardar cambios" : "Crear tarea"}
      successMessage={isEdit ? "Tarea actualizada" : "Tarea creada"}
      onSubmitAction={onSubmitAction}
      className="max-w-xl"
    >
      {({ fieldErrors }) => (
        <>
          <InputField
            id="titulo"
            label="Título de la Tarea *"
            required
            placeholder="Ej: Pegada de carteles en Av. Pellegrini"
            defaultValue={tarea?.titulo}
            error={fieldErrors?.titulo?.[0]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="prioridad"
              name="prioridad"
              label="Prioridad"
              options={PRIORIDAD_OPTIONS}
              value={prioridad}
              onChange={setPrioridad}
              error={fieldErrors?.prioridad?.[0]}
            />

            <Select
              id="estado"
              name="estado"
              label="Estado"
              options={ESTADO_OPTIONS}
              value={estado}
              onChange={setEstado}
              error={fieldErrors?.estado?.[0]}
            />
          </div>

          {/* Asignación a múltiples miembros con búsqueda en vivo desde 3 letras */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Asignar a miembros del equipo (buscador por nombre/apellido)
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                <Search size={16} className="text-text-tertiary shrink-0" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true)
                  }}
                  placeholder="Escribí al menos 3 letras para buscar (ej: Santi, Juan...)"
                  className="w-full text-sm outline-none bg-transparent placeholder:text-text-tertiary"
                />
                {isSearching && <Loader2 size={16} className="animate-spin text-primary shrink-0" />}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && memberSearch.trim().length >= 3 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-3 text-xs text-text-tertiary text-center">
                      No se encontraron miembros con "{memberSearch}"
                    </div>
                  ) : (
                    searchResults.map((m) => {
                      const isAlreadySelected = selectedMiembros.some((sm) => sm.id === m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleAddMember(m)}
                          disabled={isAlreadySelected}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                            isAlreadySelected
                              ? "bg-bg-secondary text-text-tertiary cursor-not-allowed"
                              : "hover:bg-primary-light hover:text-primary cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <User size={13} className="shrink-0" />
                            <span className="font-medium">{m.nombre} {m.apellido}</span>
                            {m.barrioNombre && (
                              <span className="text-[10px] text-text-tertiary">({m.barrioNombre})</span>
                            )}
                          </div>
                          {isAlreadySelected ? (
                            <span className="text-[10px] font-semibold text-text-tertiary">Agregado</span>
                          ) : (
                            <span className="text-[10px] font-semibold text-primary">+ Agregar</span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected members chips */}
            <div className="flex flex-wrap gap-2 pt-1 min-h-[32px] items-center">
              {selectedMiembros.length === 0 ? (
                <span className="text-xs text-text-tertiary italic">
                  Sin asignados directos (se considerará asignada a todo el equipo o general).
                </span>
              ) : (
                selectedMiembros.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary border border-primary/20"
                  >
                    <User size={12} className="shrink-0" />
                    <span>{m.nombre} {m.apellido}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-0.5 hover:bg-primary/20 rounded-full transition-colors ml-0.5"
                      title="Quitar de la lista"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id="fechaLimite"
              type="date"
              label="Fecha Límite"
              defaultValue={tarea?.fechaLimite ?? ""}
              error={fieldErrors?.fechaLimite?.[0]}
            />

            <Select
              id="barrioId"
              name="barrioId"
              label="Barrio / Zona territorial"
              options={barrioOptions}
              value={barrioId}
              onChange={setBarrioId}
              error={fieldErrors?.barrioId?.[0]}
            />
          </div>

          <InputField
            id="etiquetas"
            label="Etiquetas (separadas por coma)"
            placeholder="Ej: carteleria, fiscalizacion, redes"
            defaultValue={tarea?.etiquetas ? tarea.etiquetas.join(", ") : ""}
            error={fieldErrors?.etiquetas?.[0]}
          />

          <TextareaField
            id="descripcion"
            label="Descripción o instrucciones detalladas"
            rows={5}
            placeholder="Pautas específicas, materiales necesarios, punto de encuentro..."
            defaultValue={tarea?.descripcion ?? ""}
            error={fieldErrors?.descripcion?.[0]}
          />
        </>
      )}
    </CrudFormModal>
  )
}
