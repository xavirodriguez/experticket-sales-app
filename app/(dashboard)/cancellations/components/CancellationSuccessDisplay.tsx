"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface CancellationSuccessDisplayProps {
  /** The ID of the cancelled transaction. */
  txId: string
}

/**
 * Component for displaying a success message after a transaction is successfully cancelled.
 */
export function CancellationSuccessDisplay({ txId }: CancellationSuccessDisplayProps) {
  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h2 className="text-2xl font-bold text-foreground">Cancellation Processed</h2>
        <p className="text-muted-foreground">
          Transaction <span className="font-mono font-semibold">{txId}</span> has been cancelled.
        </p>
      </CardContent>
    </Card>
  )
}
