"use client"

import { useCallback, useState } from "react"
import { useCrud } from "../../../../lib/useCrud"
import { handleActionError } from "../../../../lib/handleActionError"
import { getPartidos, getCandidatos } from "../../../../services/oposicion"
import { deletePartido, deleteCandidato } from "../../../../actions/oposicion"
import { PartidoList } from "./PartidoList"
import { CandidatoList } from "./CandidatoList"
import { PartidoFormModal } from "./PartidoFormModal"
import { CandidatoFormModal } from "./CandidatoFormModal"
import { ConfirmModal } from "../../../../components/ConfirmModal"
import type { PaginatedResponse } from "../../../../types/pagination"
import type { PartidoResponseDTO, CandidatoResponseDTO } from "../../../../types/oposicion"
import { Plus, Users, Flag } from "lucide-react"

interface OposicionManagerProps {
  initialPartidos: PaginatedResponse<PartidoResponseDTO>
  initialCandidatos: PaginatedResponse<CandidatoResponseDTO>
  todosPartidos: PartidoResponseDTO[]
}

export function OposicionManager({ initialPartidos, initialCandidatos, todosPartidos }: OposicionManagerProps) {
  const [tab, setTab] = useState<"candidatos" | "partidos">("candidatos")
  const [deletePartidoTarget, setDeletePartidoTarget] = useState<PartidoResponseDTO | null>(null)
  const [deleteCandidatoTarget, setDeleteCandidatoTarget] = useState<CandidatoResponseDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchPartidos = useCallback(
    (page: number, pageSize: number, search?: string) => getPartidos(page, pageSize, search),
    [],
  )

  const fetchCandidatos = useCallback(
    (page: number, pageSize: number, search?: string) => getCandidatos(page, pageSize, search),
    [],
  )

  const crudPartidos = useCrud<PartidoResponseDTO>({
    fetchFn: fetchPartidos,
    initialData: initialPartidos,
    storageKey: "pageSize_partidos",
    routePath: "/oposicion",
  })

  const crudCandidatos = useCrud<CandidatoResponseDTO>({
    fetchFn: fetchCandidatos,
    initialData: initialCandidatos,
    storageKey: "pageSize_candidatos",
    routePath: "/oposicion",
  })

  async function handleDeletePartido() {
    if (!deletePartidoTarget) return
    setDeleting(true)
    const result = await deletePartido(deletePartidoTarget.id)
    setDeleting(false)
    if (result.ok) {
      setDeletePartidoTarget(null)
      crudPartidos.refreshData(1)
    } else {
      handleActionError(result)
    }
  }

  async function handleDeleteCandidato() {
    if (!deleteCandidatoTarget) return
    setDeleting(true)
    const result = await deleteCandidato(deleteCandidatoTarget.id)
    setDeleting(false)
    if (result.ok) {
      setDeleteCandidatoTarget(null)
      crudCandidatos.refreshData(1)
    } else {
      handleActionError(result)
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-0 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight mb-1">
            Contrincantes & Oposición
          </h1>
          <p className="text-sm text-text-secondary">
            Mapeo estratégico de partidos adversarios, candidatos, debilidades y nivel de amenaza
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "candidatos" ? (
            <button
              onClick={crudCandidatos.handleCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover shadow-sm transition-all whitespace-nowrap text-sm"
            >
              <Plus size={16} />
              <span>Nuevo candidato</span>
            </button>
          ) : (
            <button
              onClick={crudPartidos.handleCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover shadow-sm transition-all whitespace-nowrap text-sm"
            >
              <Plus size={16} />
              <span>Nuevo partido</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setTab("candidatos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "candidatos" ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-secondary"
          }`}
        >
          <Users size={16} />
          <span>Candidatos & Referentes</span>
        </button>
        <button
          onClick={() => setTab("partidos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "partidos" ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-secondary"
          }`}
        >
          <Flag size={16} />
          <span>Partidos & Espacios</span>
        </button>
      </div>

      {tab === "candidatos" ? (
        <CandidatoList crud={crudCandidatos} onDelete={setDeleteCandidatoTarget} />
      ) : (
        <PartidoList crud={crudPartidos} onDelete={setDeletePartidoTarget} />
      )}

      {crudPartidos.showModal && (
        <PartidoFormModal
          partido={crudPartidos.selectedItem ?? undefined}
          onClose={crudPartidos.handleClose}
          onSuccess={() => crudPartidos.refreshData(1)}
        />
      )}

      {crudCandidatos.showModal && (
        <CandidatoFormModal
          candidato={crudCandidatos.selectedItem ?? undefined}
          partidos={todosPartidos}
          onClose={crudCandidatos.handleClose}
          onSuccess={() => crudCandidatos.refreshData(1)}
        />
      )}

      <ConfirmModal
        open={!!deletePartidoTarget}
        title="Eliminar partido"
        message={deletePartidoTarget ? `¿Eliminar el partido ${deletePartidoTarget.nombre}?` : ""}
        loading={deleting}
        onClose={() => setDeletePartidoTarget(null)}
        onConfirm={handleDeletePartido}
      />

      <ConfirmModal
        open={!!deleteCandidatoTarget}
        title="Eliminar candidato"
        message={deleteCandidatoTarget ? `¿Eliminar al candidato ${deleteCandidatoTarget.nombre} ${deleteCandidatoTarget.apellido}?` : ""}
        loading={deleting}
        onClose={() => setDeleteCandidatoTarget(null)}
        onConfirm={handleDeleteCandidato}
      />
    </div>
  )
}
