"use server"

import { revalidatePath } from "next/cache"
import { apiClient } from "../lib/apiClient"
import { actionError } from "../lib/actionResult"
import type { ActionResult } from "../lib/actionResult"
import type {
  PartidoResponseDTO,
  CreatePartidoDTO,
  UpdatePartidoDTO,
  CandidatoResponseDTO,
  CreateCandidatoDTO,
  UpdateCandidatoDTO,
} from "../types/oposicion"

export async function createPartido(dto: CreatePartidoDTO): Promise<ActionResult<PartidoResponseDTO>> {
  try {
    const data = await apiClient<PartidoResponseDTO>("/api/partidos", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    revalidatePath("/oposicion")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updatePartido(id: number, dto: UpdatePartidoDTO): Promise<ActionResult<PartidoResponseDTO>> {
  try {
    const data = await apiClient<PartidoResponseDTO>(`/api/partidos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    })
    revalidatePath("/oposicion")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deletePartido(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/partidos/${id}`, { method: "DELETE" })
    revalidatePath("/oposicion")
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}

export async function createCandidato(dto: CreateCandidatoDTO): Promise<ActionResult<CandidatoResponseDTO>> {
  try {
    const data = await apiClient<CandidatoResponseDTO>("/api/candidatos", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    revalidatePath("/oposicion")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateCandidato(id: number, dto: UpdateCandidatoDTO): Promise<ActionResult<CandidatoResponseDTO>> {
  try {
    const data = await apiClient<CandidatoResponseDTO>(`/api/candidatos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    })
    revalidatePath("/oposicion")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteCandidato(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/candidatos/${id}`, { method: "DELETE" })
    revalidatePath("/oposicion")
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
