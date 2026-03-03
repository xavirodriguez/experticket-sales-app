/**
 * @module PricingTable
 * @description Component for displaying a table of product prices and totals.
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SaleState } from "../page"
import type { RealTimePriceItem } from "@/lib/experticket/types"

/**
 * Props for the PricingTable component.
 */
interface Props {
  /** The list of products currently in the cart. */
  selectedProducts: SaleState["selectedProducts"]
  /** The real-time pricing data fetched from the API. */
  prices: RealTimePriceItem[]
}

/**
 * Component for displaying real-time prices in a table.
 *
 * @param props - {@link Props}
 * @returns A JSX element containing the pricing table.
 * @example
 * ```tsx
 * <PricingTable selectedProducts={cart} prices={pricingData} />
 * ```
 */
export function PricingTable({ selectedProducts, prices }: Props) {
  const total = calculateTotal(selectedProducts, prices)

  return (
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
        {selectedProducts.map((p) => {
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
  )
}

/**
 * Calculates the total sum for the sale.
 *
 * @param selectedProducts - The list of products in the cart.
 * @param prices - The real-time pricing data.
 * @returns The total sum.
 */
function calculateTotal(
  selectedProducts: SaleState["selectedProducts"],
  prices: RealTimePriceItem[]
): number {
  return selectedProducts.reduce((sum, p) => {
    const rtPrice = prices.find((pr) => pr.ProductId === p.ProductId)
    const unitPrice = rtPrice?.Price ?? p.Price ?? 0
    return sum + unitPrice * p.quantity
  }, 0)
}
