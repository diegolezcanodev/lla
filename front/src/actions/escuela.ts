"use server"

import { revalidatePath } from "next/cache"
import { apiClient } from "../lib/apiClient"
import { actionError } from "../lib/actionResult"
import type { ActionResult } from "../lib/actionResult"
import type { EscuelaResponseDTO, CreateEscuelaDTO, UpdateEscuelaDTO } from "../types/escuela"

export async function createEscuela(dto: CreateEscuelaDTO): Promise<ActionResult<EscuelaResponseDTO>> {
  try {
    const data = await apiClient<EscuelaResponseDTO>("/api/escuelas", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    revalidatePath("/escuelas")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateEscuela(id: number, dto: UpdateEscuelaDTO): Promise<ActionResult<EscuelaResponseDTO>> {
  try {
    const data = await apiClient<EscuelaResponseDTO>(`/api/escuelas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    })
    revalidatePath("/escuelas")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteEscuela(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/escuelas/${id}`, { method: "DELETE" })
    revalidatePath("/escuelas")
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
