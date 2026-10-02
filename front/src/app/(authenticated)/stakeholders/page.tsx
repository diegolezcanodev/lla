import { cookies } from "next/headers"
import { StakeholdersManager } from "./_components/StakeholdersManager"
import { getStakeholders } from "../../../services/stakeholders"
import { readPageSize } from "../../../lib/pageSizeCookie"
import type { PaginatedResponse } from "../../../types/pagination"
import type { StakeholderResponseDTO } from "../../../types/stakeholder"

export default async function StakeholdersPage() {
  const cookieStore = await cookies()
  const pageSize = readPageSize(cookieStore, "pageSize_stakeholders")
  const initialData = await getStakeholders(1, pageSize).catch(
    (): PaginatedResponse<StakeholderResponseDTO> => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    }),
  )

  return (
    <div className="p-8 flex flex-col flex-1 min-h-0">
      <StakeholdersManager initialData={initialData} />
    </div>
  )
}
