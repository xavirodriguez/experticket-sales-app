/**
 * @module AccessCodesPage
 * @description Page for retrieving and managing ticket access codes/barcodes for a transaction.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { QrCode, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetcher, normalizeApiResponse } from "@/lib/experticket/client"
import { StatusBadge } from "@/components/status-badge"
import { SearchCard } from "@/components/experticket/SearchCard"
import { PageHeader } from "@/components/experticket/PageHeader"
import { ErrorAlert } from "@/components/experticket/ErrorAlert"

/**
 * Shape of an access code item for display purposes.
 */
interface AccessCodeDisplayItem {
  Id?: string | number
  CodeId?: string | number
  Code?: string
  AccessCode?: string
  Barcode?: string
  ProductName?: string
  Product?: string
  Type?: string
  CodeType?: string
  Status?: string
}

/**
 * Main Access Codes Page component.
 * Allows users to fetch the list of barcodes/QR codes associated with a specific sale.
 */
export default function AccessCodesPage() {
  const [txId, setTxId] = useState("")
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
  function handleSearch() {
    if (!txId.trim()) return
    setSearchedTxId(txId.trim())
  }

  /**
   * Copies a code to the system clipboard and shows a temporary success state.
   * @param text - The code value to copy.
   * @param id - The unique ID of the item for state tracking.
   */
  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  /** Normalizes the access codes into a flat array. */
  const codes = normalizeApiResponse<AccessCodeDisplayItem>(data, ["AccessCodes", "Codes"])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Access Codes"
        description="Retrieve and manage access codes for valid transactions"
      />

      <SearchCard
        title="Search Access Codes"
        description="Enter a Transaction ID to retrieve access codes"
        inputLabel="Transaction ID"
        inputPlaceholder="Enter transaction ID..."
        searchValue={txId}
        onSearchValueChange={setTxId}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {error && (
        <ErrorAlert message="Failed to fetch access codes. Please check the Transaction ID." />
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
                {codes.map((code, i) => {
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
