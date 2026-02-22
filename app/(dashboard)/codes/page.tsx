/**
 * @module AccessCodesPage
 * @description Page for retrieving and managing ticket access codes/barcodes for a transaction.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertCircle, QrCode, Copy, Check } from "lucide-react"
import { fetcher, normalizeApiResponse } from "@/lib/experticket/client"
import type { AccessCodeTransaction } from "@/lib/experticket/types"
import { StatusBadge } from "@/components/status-badge"
import { SearchCard } from "@/components/search-card"

/**
 * Main Access Codes Page component.
 * Allows users to fetch the list of barcodes/QR codes associated with a specific sale.
 */
export default function AccessCodesPage() {
  const [searchedTxId, setSearchedTxId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /**
   * Fetches access code data based on the searched Transaction ID.
   */
  const { data, isLoading, error } = useSWR(
    searchedTxId ? `/api/experticket/accesscodes?SaleId=${encodeURIComponent(searchedTxId)}` : null,
    fetcher
  )

  /**
   * Trigger a search for the entered Transaction ID.
   */
  const handleSearch = (id: string) => {
    setSearchedTxId(id)
  }

  /**
   * Copies a code to the system clipboard and shows a temporary success state.
   * @param text - The code value to copy.
   * @param id - The unique ID of the item for state tracking.
   */
  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  /** Normalizes the access codes into a flat array. */
  const codes = normalizeApiResponse<any>(data, ["AccessCodes", "Codes"])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Codes</h1>
        <p className="text-muted-foreground mt-1">Retrieve QR codes and access codes for tickets</p>
      </div>

      <SearchCard
        title="Search Access Codes"
        description="Enter a Transaction ID to retrieve access codes"
        label="Transaction ID"
        placeholder="Enter transaction ID..."
        isLoading={isLoading}
        onSearch={handleSearch}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to fetch access codes. Please check the Transaction ID.</AlertDescription>
        </Alert>
      )}

      {codes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Access Codes
            </CardTitle>
            <CardDescription>{codes.length} code(s) for transaction {searchedTxId}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code: any, i) => {
                  const codeValue = String(code.Code || code.AccessCode || code.Barcode || `CODE-${i + 1}`)
                  const codeId = String(code.Id || code.CodeId || i)
                  return (
                    <TableRow key={codeId}>
                      <TableCell className="font-mono text-sm font-semibold">{codeValue}</TableCell>
                      <TableCell>{String(code.ProductName || code.Product || "N/A")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{String(code.Type || code.CodeType || "Barcode")}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={String(code.Status || "Active")} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(codeValue, codeId)}
                        >
                          {copiedId === codeId ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {searchedTxId && !isLoading && codes.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <QrCode className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No access codes found for this transaction.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
