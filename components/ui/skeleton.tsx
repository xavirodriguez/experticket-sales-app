/**
 * @module Skeleton
 * @description A placeholder component used while content is loading.
 */

import { cn } from '@/lib/utils'

/**
 * Skeleton component for loading states.
 *
 * @param props - React div props.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * ```
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
