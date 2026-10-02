"use client"

import { useState } from "react"
import { addComentarioTarea } from "../../../../actions/tarea"
import { ModalOverlay } from "../../../../components/ModalOverlay"
import { AsyncButton } from "../../../../components/AsyncButton"
import type { TareaResponseDTO, ComentarioItem } from "../../../../types/tarea"
import { MessageSquare, Send, Calendar, User, Tag, MapPin, X } from "lucide-react"

interface TareaDetalleModalProps {
  tarea: TareaResponseDTO
  onClose: () => void
  onComentarioAgregado: () => void
}

export function TareaDetalleModal({ tarea, onClose, onComentarioAgregado }: TareaDetalleModalProps) {
  const [comentarios, setComentarios] = useState<ComentarioItem[]>(tarea.comentarios || [])
  const [autor, setAutor] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!mensaje.trim()) return
    setEnviando(true)
    const result = await addComentarioTarea(
      tarea.id,
      autor.trim() || "Equipo",
      mensaje.trim(),
    )
    setEnviando(false)
    if (result.ok) {
      setComentarios([...comentarios, result.data])
      setMensaje("")
      onComentarioAgregado()
    }
  }

  return (
    <ModalOverlay open onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-card-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-bg-raised">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary">
                {tarea.estado}
              </span>
              <span className="text-xs font-bold text-orange uppercase tracking-wider">
                {tarea.prioridad}
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">{tarea.titulo}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {tarea.descripcion && (
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Instrucciones & Descripción
              </h4>
              <p className="text-sm text-text-primary bg-bg-secondary/50 p-3 rounded-lg whitespace-pre-wrap">
                {tarea.descripcion}
              </p>
            </div>
          )}

          {/* Metadata badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2 p-2.5 rounded-lg border border-border">
              <User size={15} className="text-text-tertiary mt-0.5" />
              <div>
                <p className="text-text-tertiary font-medium">Asignados</p>
                <p className="text-text-primary font-semibold">
                  {tarea.asignados && tarea.asignados.length > 0
                    ? tarea.asignados.map((a) => `${a.nombre} ${a.apellido}`).join(", ")
                    : "Todo el equipo"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
              <Calendar size={15} className="text-text-tertiary" />
              <div>
                <p className="text-text-tertiary font-medium">Fecha Límite</p>
                <p className="text-text-primary font-semibold">{tarea.fechaLimite || "Sin límite"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border">
              <MapPin size={15} className="text-text-tertiary" />
              <div>
                <p className="text-text-tertiary font-medium">Territorio</p>
                <p className="text-text-primary font-semibold truncate">
                  {tarea.barrioNombre || "General"}
                </p>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-accent" />
              <span>Hilo de Comentarios ({comentarios.length})</span>
            </h4>

            <div className="space-y-3 mb-4">
              {comentarios.length === 0 ? (
                <p className="text-xs text-text-tertiary italic p-3 bg-bg-secondary rounded-lg">
                  No hay comentarios en este ticket todavía. Podés dejar el primero.
                </p>
              ) : (
                comentarios.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-bg-secondary/60 border border-border/60">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-text-primary">{c.autor}</span>
                      <span className="text-text-tertiary">{new Date(c.creadoEn).toLocaleString("es-AR")}</span>
                    </div>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{c.mensaje}</p>
                  </div>
                ))
              )}
            </div>

            {/* Formulario nuevo comentario */}
            <form onSubmit={handleSend} className="space-y-2 border-t border-border pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tu nombre (opcional)"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-1/3 px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Escribí un comentario o actualización..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <AsyncButton
                  type="submit"
                  loading={enviando}
                  className="px-3 py-2 bg-primary text-white text-xs rounded-lg font-medium flex items-center gap-1"
                >
                  <Send size={13} />
                  <span>Enviar</span>
                </AsyncButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}
