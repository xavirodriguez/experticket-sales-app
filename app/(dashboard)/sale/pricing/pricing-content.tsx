/**
 * @module PricingContent
 * @description Sub-component for displaying the status of the pricing fetch.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle } from "lucide-react"

/**
 * Props for the PricingContent component.
 */
interface Props {
  loading: boolean
  fetched: boolean
  success?: boolean
  errorMessage?: string | null
}

/**
 * Renders the content area of the Pricing step based on current status.
 *
 * @param props - {@link Props}
 * @returns A JSX element.
 */
export function PricingContent({
  loading,
  fetched,
  success,
  errorMessage,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (!fetched) {
    return (
      <p className="text-sm text-muted-foreground">
        Click "Fetch Prices" to get real-time pricing, or proceed with catalog prices.
      </p>
    )
  }

  if (success === false) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Pricing error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return undefined
}
