/**
 * @module CapacityComponents
 * @description Small UI components for the Step 2 (Capacity) wizard.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

/**
 * Loading skeleton for the capacity table.
 * @returns A JSX element.
 */
export function CapacitySkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

/**
 * Component for displaying a message when no capacity restrictions exist.
 *
 * @param props - Component props including the selected access date.
 * @returns A JSX element.
 */
export function NoRestrictions({ accessDate }: { accessDate: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        No specific capacity restrictions found for the selected products on {accessDate}. You can
        proceed.
      </p>
      <Badge variant="secondary">Unlimited availability</Badge>
    </div>
  )
}
