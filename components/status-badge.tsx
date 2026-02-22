/**
 * @module StatusBadge
 * @description A reusable badge component for displaying transaction or item statuses with consistent coloring.
 */

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Props for the {@link StatusBadge} component.
 */
interface StatusBadgeProps {
  /** The status text to display. */
  status: string
  /** Additional CSS classes. */
  className?: string
}

/**
 * StatusBadge component that automatically selects a color based on the status text.
 *
 * @param props - {@link StatusBadgeProps}
 *
 * @example
 * ```tsx
 * <StatusBadge status="Confirmed" />
 * ```
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const lower = status.toLowerCase()

  // Success statuses
  if (
    lower.includes("confirm") ||
    lower.includes("complete") ||
    lower.includes("ok") ||
    lower.includes("active") ||
    lower.includes("valid") ||
    lower.includes("success") ||
    lower === "cancellable"
  ) {
    return (
      <Badge className={cn("bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100/80", className)}>
        {status}
      </Badge>
    )
  }

  // Error/Cancelled statuses
  if (
    (lower.includes("cancel") && lower !== "cancellable") ||
    lower.includes("refund") ||
    lower.includes("fail") ||
    lower.includes("error")
  ) {
    return <Badge variant="destructive" className={className}>{status}</Badge>
  }

  // Pending statuses
  if (lower.includes("pending") || lower.includes("reserv") || lower.includes("wait")) {
    return (
      <Badge className={cn("bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-100/80", className)}>
        {status}
      </Badge>
    )
  }

  // Default status
  return <Badge variant="secondary" className={className}>{status}</Badge>
}
