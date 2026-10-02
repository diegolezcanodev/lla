"use server"

import { revalidatePath } from "next/cache"
import { apiClient } from "../lib/apiClient"
import { actionError } from "../lib/actionResult"
import type { ActionResult } from "../lib/actionResult"
import type { ReclamoResponseDTO, CreateReclamoDTO, UpdateReclamoDTO } from "../types/reclamo"

export async function createReclamo(dto: CreateReclamoDTO): Promise<ActionResult<ReclamoResponseDTO>> {
  try {
    const data = await apiClient<ReclamoResponseDTO>("/api/reclamos", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    revalidatePath("/reclamos")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateReclamo(id: number, dto: UpdateReclamoDTO): Promise<ActionResult<ReclamoResponseDTO>> {
  try {
    const data = await apiClient<ReclamoResponseDTO>(`/api/reclamos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    })
    revalidatePath("/reclamos")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteReclamo(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/reclamos/${id}`, { method: "DELETE" })
    revalidatePath("/reclamos")
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
