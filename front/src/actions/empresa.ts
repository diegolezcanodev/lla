"use server"

import { revalidatePath } from "next/cache"
import { apiClient } from "../lib/apiClient"
import { actionError } from "../lib/actionResult"
import type { ActionResult } from "../lib/actionResult"
import type { EmpresaResponseDTO, CreateEmpresaDTO, UpdateEmpresaDTO } from "../types/empresa"

export async function createEmpresa(dto: CreateEmpresaDTO): Promise<ActionResult<EmpresaResponseDTO>> {
  try {
    const data = await apiClient<EmpresaResponseDTO>("/api/empresas", {
      method: "POST",
      body: JSON.stringify(dto),
    })
    revalidatePath("/empresas")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function updateEmpresa(id: number, dto: UpdateEmpresaDTO): Promise<ActionResult<EmpresaResponseDTO>> {
  try {
    const data = await apiClient<EmpresaResponseDTO>(`/api/empresas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    })
    revalidatePath("/empresas")
    return { ok: true, data }
  } catch (err) {
    return actionError(err)
  }
}

export async function deleteEmpresa(id: number): Promise<ActionResult<void>> {
  try {
    await apiClient<void>(`/api/empresas/${id}`, { method: "DELETE" })
    revalidatePath("/empresas")
    return { ok: true, data: undefined }
  } catch (err) {
    return actionError(err)
  }
}
