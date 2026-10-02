"use server"

import { revalidatePath } from "next/cache"
import { apiClient } from "../lib/apiClient"
import { actionError } from "../lib/actionResult"
import type { ActionResult } from "../lib/actionResult"
import type { TareaResponseDTO, CreateTareaDTO, UpdateTareaDTO, ComentarioItem } from "../types/tarea"

export async function createTarea(dto: CreateTareaDTO): Promise<ActionResult<TareaResponseDTO>> {
  try {
    const data = await apiClient<TareaResponseDTO>("/api/tareas", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    revalidatePath("/tareas")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateTarea(id: number, dto: UpdateTareaDTO): Promise<ActionResult<TareaResponseDTO>> {
  try {
    const data = await apiClient<TareaResponseDTO>(`/api/tareas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    })
    revalidatePath("/tareas")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteTarea(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/tareas/${id}`, { method: "DELETE" })
    revalidatePath("/tareas")
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}

export async function addComentarioTarea(
  tareaId: number,
  autor: string,
  mensaje: string,
): Promise<ActionResult<ComentarioItem>> {
  try {
    const data = await apiClient<ComentarioItem>(`/api/tareas/${tareaId}/comentarios`, {
      method: "POST",
      body: JSON.stringify({ autor, mensaje }),
    })
    revalidatePath("/tareas")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}
