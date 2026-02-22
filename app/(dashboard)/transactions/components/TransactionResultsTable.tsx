"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { getTransactionId, formatCurrency } from "@/lib/experticket/utils"
import type { Transaction } from "@/lib/experticket/types"

/**
 * Props for the {@link TransactionResultsTable} component.
 */
interface TransactionResultsTableProps {
  /** List of transactions to display. */
  transactions: Transaction[]
  /** Callback triggered when a transaction is selected for viewing. */
  onSelectTransaction: (tx: Transaction) => void
}

/**
 * Component for displaying a list of transaction search results in a table.
 *
 * @param props - Component props.
 * @returns The rendered results table.
 */
export function TransactionResultsTable({
  transactions,
  onSelectTransaction,
}: TransactionResultsTableProps) {
  if (transactions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>{transactions.length} transaction(s) found</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, i) => (
              <TableRow key={getTransactionId(tx) + i}>
                <TableCell className="font-mono text-sm">{getTransactionId(tx)}</TableCell>
                <TableCell>{String(tx.TransactionDateTime || tx.DateTime || tx.Date || "N/A")}</TableCell>
                <TableCell>
                  <StatusBadge status={String(tx.Status || tx.TransactionStatus || "Unknown")} />
                </TableCell>
                <TableCell>{formatCurrency(tx)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onSelectTransaction(tx)}>
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/**
 * Displays a badge indicating the status of a transaction.
 */
function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase()
  if (lower.includes("confirm") || lower.includes("complete") || lower.includes("ok")) {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        {status}
      </Badge>
    )
  }
  if (lower.includes("cancel") || lower.includes("refund")) {
    return <Badge variant="destructive">{status}</Badge>
  }
  if (lower.includes("pending") || lower.includes("reserv")) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        {status}
      </Badge>
    )
  }
  return <Badge variant="secondary">{status}</Badge>
}
