import { getSkeletonForRoute } from './skeletons'

export function PageSkeleton({
  path,
  className = '',
}: {
  path?: string | null
  className?: string
}) {
  const Skeleton = getSkeletonForRoute(path)
  return <Skeleton className={className} />
}

