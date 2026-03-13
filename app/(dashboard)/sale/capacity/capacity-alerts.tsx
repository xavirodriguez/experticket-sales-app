/**
 * @module CapacityAlerts
 * @description Components for displaying alerts related to capacity status.
 */

import { AlertTriangle } from "lucide-react"

/**
 * Component for displaying an error message during capacity check.
 *
 * @param props - Component props.
 * @returns A JSX element displaying the error.
 * @example
 * ```tsx
 * <CapacityError message="Unable to reach API" />
 * ```
 */
export function CapacityError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">Failed to check capacity</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}

/**
 * Component for displaying an alert when no capacity is available.
 *
 * @returns A JSX element displaying the no-capacity alert.
 * @example
 * ```tsx
 * <NoCapacityAlert />
 * ```
 */
export function NoCapacityAlert() {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">No capacity available</p>
        <p className="text-sm">
          One or more products have 0 available capacity for this date. You cannot proceed with the
          sale.
        </p>
      </div>
    </div>
  )
}
