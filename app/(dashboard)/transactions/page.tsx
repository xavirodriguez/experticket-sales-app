/**
 * @module TransactionsPage
 * @description Page for searching and viewing details of completed transactions.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertCircle, Eye, Search } from "lucide-react"
import { fetcher, normalizeApiResponse } from "@/lib/experticket/client"
import type { Transaction } from "@/lib/experticket/types"
import { StatusBadge } from "@/components/status-badge"
import { SearchCard } from "@/components/search-card"
import { TransactionDetail } from "./transaction-detail"

/**
 * Main Transactions Page component.
 * Allows users to search for transactions by ID and view their full details.
 */
export default function TransactionsPage() {
  const [searchedId, setSearchedId] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches transaction data when a search ID is provided.
   */
  const { data: txData, isLoading } = useSWR(
    searchedId ? `/api/experticket/transaction?SaleId=${encodeURIComponent(searchedId)}` : null,
    fetcher
  )

  /**
   * Handles the search action.
   */
  const handleSearch = (id: string) => {
    setError(null)
    setSelectedTx(null)
    setSearchedId(id)
  }

  /**
   * Normalizes the API response into an array of transactions.
   */
  const transactions = normalizeApiResponse<Transaction>(txData, ["Transactions"])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-1">Search and manage completed transactions</p>
      </div>

      <SearchCard
        title="Search Transactions"
        description="Enter a Transaction ID to find details"
        label="Transaction ID"
        placeholder="Enter transaction ID..."
        isLoading={isLoading}
        onSearch={handleSearch}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedTx ? (
        <TransactionDetail
          transaction={selectedTx}
          onBack={() => setSelectedTx(null)}
        />
      ) : (
        transactions.length > 0 && (
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
                    <TableRow key={String(tx.SaleId || tx.TransactionId || tx.Id || i)}>
                      <TableCell className="font-mono text-sm">
                        {String(tx.SaleId || tx.TransactionId || tx.Id || "N/A")}
                      </TableCell>
                      <TableCell>{String(tx.TransactionDateTime || tx.DateTime || tx.Date || "N/A")}</TableCell>
                      <TableCell>
                        <StatusBadge status={String(tx.Status || tx.TransactionStatus || "Unknown")} />
                      </TableCell>
                      <TableCell>
                        {tx.TotalPrice !== undefined
                          ? `${Number(tx.TotalPrice).toFixed(2)} EUR`
                          : tx.TotalAmount !== undefined
                            ? `${Number(tx.TotalAmount).toFixed(2)} ${String(tx.Currency || "EUR")}`
                            : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedTx(tx)}>
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
      )}

      {searchedId && !isLoading && transactions.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No transactions found for the given ID.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
