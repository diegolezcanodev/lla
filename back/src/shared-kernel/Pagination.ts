export interface PaginationInput {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function paginateQuery<T>(
  model: { findMany: (...args: any[]) => any; count: (...args: any[]) => any },
  params: PaginationInput,
  args?: { where?: any; orderBy?: any; include?: any },
): Promise<PaginatedResult<T>> {
  const skip = (params.page - 1) * params.limit
  const [data, total] = await Promise.all([
    model.findMany({ skip, take: params.limit, ...args }) as Promise<T[]>,
    model.count({ where: args?.where }) as Promise<number>,
  ])
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  }
}
