"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import type { SaleState } from "./page"
import type { AvailableCapacityResponse } from "@/lib/experticket/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  state: SaleState
  updateState: (p: Partial<SaleState>) => void
  onNext: () => void
  onBack: () => void
}

export function StepCapacity({ state, updateState, onNext, onBack }: Props) {
  const productIds = state.selectedProducts.map((p) => p.ProductId).join(",")
  const params = new URLSearchParams({
    ProductIds: productIds,
    Dates: state.accessDate,
    IncludePrices: "true",
  })

  const { data, isLoading, error } = useSWR<AvailableCapacityResponse>(
    `/api/experticket/capacity?${params.toString()}`,
    fetcher
  )

  const [acknowledged, setAcknowledged] = useState(false)

  const capacityItems = [
    ...(data?.ProductBases || []),
    ...(data?.Products || []),
    ...(data?.Sessions || []),
  ]

  const hasCapacity = capacityItems.length === 0 || capacityItems.some(
    (c) => c.AvailableCapacity === undefined || c.AvailableCapacity > 0
  )

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
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : error || (data && !data.Success) ? (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Failed to check capacity</p>
                <p className="text-sm">{data?.ErrorMessage || "Network error"}</p>
              </div>
            </div>
          ) : capacityItems.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No specific capacity restrictions found for the selected products on {state.accessDate}.
                You can proceed.
              </p>
              <Badge variant="secondary">Unlimited availability</Badge>
            </div>
          ) : (
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
                {capacityItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">
                      {item.ProductId || item.ProductBaseId || item.SessionId}
                    </TableCell>
                    <TableCell>{item.Date ? new Date(item.Date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      {item.AvailableCapacity !== undefined ? (
                        <Badge
                          variant={item.AvailableCapacity > 0 ? "secondary" : "destructive"}
                        >
                          {item.AvailableCapacity}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Unlimited</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.Price != null ? `${item.Price.toFixed(2)} EUR` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!hasCapacity && !acknowledged && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">No capacity available</p>
                <p className="text-sm">
                  One or more products have 0 available capacity for this date.
                  You cannot proceed with the sale.
                </p>
              </div>
            </div>
          )}
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
