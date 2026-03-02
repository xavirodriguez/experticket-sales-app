/**
 * @module StepCapacity
 * @description Step 2 of the sale process: Check availability for the selected products and date.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { fetcher } from "@/lib/experticket/client"
import type { SaleState } from "./page"
import type { AvailableCapacityResponse, CapacityItem } from "@/lib/experticket/types"

/**
 * Props for the {@link StepCapacity} component.
 */
interface Props {
  /** Current global sale state. */
  state: SaleState
  /** Function to update the global sale state. */
  updateState: (p: Partial<SaleState>) => void
  /** Callback to navigate to the next step. */
  onNext: () => void
  /** Callback to navigate back to the previous step. */
  onBack: () => void
}

/**
 * Component for Step 2: Capacity.
 * Checks for availability restrictions on the selected products.
 */
export function StepCapacity({ state, updateState, onNext, onBack }: Props) {
  const params = new URLSearchParams({
    ProductIds: state.selectedProducts.map((p) => p.ProductId).join(","),
    Dates: state.accessDate,
    IncludePrices: "true",
  })

  const { data, isLoading, error } = useSWR<AvailableCapacityResponse>(
    `/api/experticket/capacity?${params.toString()}`,
    fetcher
  )

  const [acknowledged] = useState(false)
  const capacityItems = resolveCapacityItems(data)
  const hasCapacity = checkHasCapacity(capacityItems)

  /**
   * Saves the capacity data to global state and proceeds to the next step.
   */
  function handleNext() {
    updateState({ capacityData: capacityItems })
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CapacitySkeleton />
          ) : error || (data && !data.Success) ? (
            <CapacityError message={data?.ErrorMessage || "Network error"} />
          ) : capacityItems.length === 0 ? (
            <NoRestrictions accessDate={state.accessDate} />
          ) : (
            <CapacityTable items={capacityItems} />
          )}

          {!hasCapacity && !acknowledged && <NoCapacityAlert />}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!hasCapacity && !acknowledged}>
          Next: Pricing
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// --- Sub-components ---

function CapacitySkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

function CapacityError({ message }: { message: string }) {
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

function NoRestrictions({ accessDate }: { accessDate: string }) {
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

function CapacityTable({ items }: { items: CapacityItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Available</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, idx) => (
          <TableRow key={idx}>
            <TableCell className="font-mono text-xs">
              {item.ProductId || item.ProductBaseId || item.SessionId}
            </TableCell>
            <TableCell>{item.Date ? new Date(item.Date).toLocaleDateString() : "-"}</TableCell>
            <TableCell>
              <CapacityBadge available={item.AvailableCapacity} />
            </TableCell>
            <TableCell>{item.Price != null ? `${item.Price.toFixed(2)} EUR` : "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function CapacityBadge({ available }: { available?: number }) {
  if (available === undefined) {
    return <Badge variant="secondary">Unlimited</Badge>
  }
  return (
    <Badge variant={available > 0 ? "secondary" : "destructive"}>
      {available}
    </Badge>
  )
}

function NoCapacityAlert() {
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

// --- Helper Functions ---

function resolveCapacityItems(data?: AvailableCapacityResponse): CapacityItem[] {
  return [
    ...(data?.ProductBases || []),
    ...(data?.Products || []),
    ...(data?.Sessions || []),
  ]
}

function checkHasCapacity(items: CapacityItem[]): boolean {
  if (items.length === 0) return true
  return items.every((c) => c.AvailableCapacity === undefined || c.AvailableCapacity > 0)
}
