/**
 * @module SaleSuccessScreen
 * @description Component for displaying a success screen after a successful transaction.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, QrCode, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DomainTransaction } from "@/lib/experticket/adapter"

/**
 * Props for the SaleSuccessScreen component.
 */
interface Props {
  /** The finalized transaction details. */
  transaction: DomainTransaction
  /** Callback to reset the sale wizard. */
  onReset: () => void
}

/**
 * Component for displaying a success screen after a successful transaction.
 *
 * @param props - {@link Props}
 * @returns A JSX element containing the success message, transaction details, and actions.
 * @example
 * ```tsx
 * <SaleSuccessScreen transaction={txData} onReset={reset} />
 * ```
 */
export function SaleSuccessScreen({
  transaction,
  onReset,
}: Props) {
  const saleId = transaction.saleId || transaction.transactionId || ""
  return (
    <div className="space-y-6">
      <SuccessCard saleId={saleId} totalPrice={transaction.totalPrice} />

      <TransactionProductsCard products={transaction.products || []} />

      <QuickActionsCard saleId={saleId} onReset={onReset} />
    </div>
  )
}

function SuccessCard({ saleId, totalPrice }: { saleId: string; totalPrice?: number }) {
  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h2 className="text-2xl font-bold text-foreground">Sale Complete!</h2>
        <p className="text-muted-foreground">
          Transaction ID: <span className="font-mono font-semibold">{saleId}</span>
        </p>
        {totalPrice != null && (
          <p className="text-lg font-semibold">{totalPrice.toFixed(2)} EUR</p>
        )}
      </CardContent>
    </Card>
  )
}

function TransactionProductsCard({ products }: { products: DomainTransaction["products"] }) {
  if (!products || products.length === 0) return undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{p.productName || p.productId}</p>
                {p.accessCode && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    Access: {p.accessCode}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {p.price != null && (
                  <span className="text-sm font-medium">{p.price.toFixed(2)} EUR</span>
                )}
                <Badge
                  variant={p.status === 1 || p.status === undefined ? "secondary" : "destructive"}
                >
                  {p.status === 1 || p.status === undefined ? "OK" : `Status ${p.status}`}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionsCard({ saleId, onReset }: { saleId: string; onReset: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => window.open(`/documents?txId=${saleId}`, "_self")}>
          <FileText className="mr-2 h-4 w-4" />
          View Documents
        </Button>
        <Button variant="outline" onClick={() => window.open(`/codes?txId=${saleId}`, "_self")}>
          <QrCode className="mr-2 h-4 w-4" />
          View Access Codes
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </CardContent>
    </Card>
  )
}
