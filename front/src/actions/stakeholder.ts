"use server"

import { revalidatePath } from "next/cache"
import { apiClient } from "../lib/apiClient"
import { actionError } from "../lib/actionResult"
import type { ActionResult } from "../lib/actionResult"
import type { StakeholderResponseDTO, CreateStakeholderDTO, UpdateStakeholderDTO } from "../types/stakeholder"

export async function createStakeholder(dto: CreateStakeholderDTO): Promise<ActionResult<StakeholderResponseDTO>> {
  try {
    const data = await apiClient<StakeholderResponseDTO>("/api/stakeholders", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    revalidatePath("/stakeholders")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateStakeholder(id: number, dto: UpdateStakeholderDTO): Promise<ActionResult<StakeholderResponseDTO>> {
  try {
    const data = await apiClient<StakeholderResponseDTO>(`/api/stakeholders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    })
    revalidatePath("/stakeholders")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function registrarContactoStakeholder(id: number, fecha?: string): Promise<ActionResult<StakeholderResponseDTO>> {
  try {
    const data = await apiClient<StakeholderResponseDTO>(`/api/stakeholders/${id}/contacto`, {
      method: "POST",
      body: JSON.stringify({ fecha }),
    })
    revalidatePath("/stakeholders")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteStakeholder(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/stakeholders/${id}`, { method: "DELETE" })
    revalidatePath("/stakeholders")
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
