import { CreateTareaDTO, UpdateTareaDTO, TareaResponseDTO } from "./TareaDTO"
import { ComentarioItem } from "../domain/TareaEntity"
import { PaginatedResult } from "../../../shared-kernel/Pagination"
import { FindTareasParams } from "../domain/ITareaRepository"

export interface ITareaAppService {
  create(dto: CreateTareaDTO): Promise<TareaResponseDTO>
  update(id: number, dto: UpdateTareaDTO): Promise<TareaResponseDTO>
  delete(id: number): Promise<void>
  getById(id: number): Promise<TareaResponseDTO>
  list(params: FindTareasParams): Promise<PaginatedResult<TareaResponseDTO>>
  addComentario(tareaId: number, autor: string, mensaje: string, usuarioId?: number): Promise<ComentarioItem>
}
