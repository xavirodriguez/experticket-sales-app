"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, AlertTriangle, RefreshCw } from "lucide-react"
import type { SaleState } from "./page"
import type { RealTimePricesResponse } from "@/lib/experticket/types"

interface Props {
  state: SaleState
  updateState: (p: Partial<SaleState>) => void
  onNext: () => void
  onBack: () => void
}

export function StepPricing({ state, updateState, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RealTimePricesResponse | null>(null)
  const [fetched, setFetched] = useState(false)

  async function fetchPrices() {
    setLoading(true)
    try {
      const body = {
        ProductIds: state.selectedProducts.map((p) => p.ProductId),
        StartDate: state.accessDate,
        EndDate: state.accessDate,
      }
      const res = await fetch("/api/experticket/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json: RealTimePricesResponse = await res.json()
      setData(json)
      setFetched(true)
      if (!json.Success) {
        toast.error(json.ErrorMessage || "Failed to fetch prices")
      }
    } catch {
      toast.error("Network error fetching prices")
    } finally {
      setLoading(false)
    }
  }

  const prices = data?.ProductsRealTimePrices || []

  // Calculate total using real-time prices if available, otherwise catalog prices
  const total = state.selectedProducts.reduce((sum, p) => {
    const rtPrice = prices.find((pr) => pr.ProductId === p.ProductId)
    const unitPrice = rtPrice?.Price ?? p.Price ?? 0
    return sum + unitPrice * p.quantity
  }, 0)

  function handleNext() {
    updateState({ pricingData: prices })
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Real-Time Pricing</CardTitle>
          <Button size="sm" variant="outline" onClick={fetchPrices} disabled={loading}>
            <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            {fetched ? "Refresh" : "Fetch Prices"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !fetched ? (
            <p className="text-sm text-muted-foreground">
              Click "Fetch Prices" to get real-time pricing, or proceed with catalog prices.
            </p>
          ) : data && !data.Success ? (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Pricing error</p>
                <p className="text-sm">{data.ErrorMessage}</p>
              </div>
            </div>
          ) : null}

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.selectedProducts.map((p) => {
                const rtPrice = prices.find((pr) => pr.ProductId === p.ProductId)
                const unitPrice = rtPrice?.Price ?? p.Price ?? 0
                return (
                  <TableRow key={p.ProductId}>
                    <TableCell>{p.ProductName || p.ProductId}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>{unitPrice.toFixed(2)} EUR</TableCell>
                    <TableCell className="font-medium">
                      {(unitPrice * p.quantity).toFixed(2)} EUR
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Estimated Total
                </TableCell>
                <TableCell className="font-bold">{total.toFixed(2)} EUR</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext}>
          Next: Questions
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
