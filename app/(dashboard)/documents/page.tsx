/**
 * @module DocumentsPage
 * @description Page for searching and retrieving PDF tickets or vouchers for a transaction.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, AlertCircle, FileText, Download, ExternalLink } from "lucide-react"
import { fetcher } from "@/lib/experticket/client"
import { normalizeApiResponse } from "@/lib/experticket/utils"
import { StatusBadge } from "@/components/status-badge"
import { SearchCard } from "@/components/experticket/SearchCard"

/**
 * Main Documents Page component.
 * Allows users to fetch and download documents associated with a sale ID.
 */
export default function DocumentsPage() {
  const [txId, setTxId] = useState("")
  const [searchedTxId, setSearchedTxId] = useState<string | null>(null)

  /**
   * Fetches document links based on the Transaction ID.
   */
  const { data, isLoading, error } = useSWR(
    searchedTxId ? `/api/experticket/documents?id=${encodeURIComponent(searchedTxId)}` : null,
    fetcher
  )

  /**
   * Triggers the search for documents.
   */
  function handleSearch() {
    if (!txId.trim()) return
    setSearchedTxId(txId.trim())
  }

  /** Normalizes the response into an array of document records. */
  const documents = normalizeApiResponse(data, ["Documents"])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
        <p className="text-muted-foreground mt-1">Retrieve tickets, vouchers, and documents for a transaction</p>
      </div>

      <SearchCard
        title="Search Documents"
        description="Enter a Transaction ID to retrieve associated documents"
        inputLabel="Transaction ID"
        inputPlaceholder="Enter transaction ID..."
        searchValue={txId}
        onSearchValueChange={setTxId}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to fetch documents. Please check the Transaction ID.</AlertDescription>
        </Alert>
      )}

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents Found
            </CardTitle>
            <CardDescription>{documents.length} document(s) for transaction {searchedTxId}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc, i) => (
                  <TableRow key={String(doc.DocumentId || doc.Id || i)}>
                    <TableCell className="font-mono text-sm">
                      {String(doc.DocumentId || doc.Id || `DOC-${i + 1}`)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{String(doc.Type || doc.DocumentType || "Ticket")}</Badge>
                    </TableCell>
                    <TableCell>{String(doc.ProductName || doc.Product || "N/A")}</TableCell>
                    <TableCell>
                      <StatusBadge status={String(doc.Status || "Active")} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {doc.Url || doc.DownloadUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(String(doc.Url || doc.DownloadUrl), "_blank")}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        ) : null}
                        {doc.ViewUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(String(doc.ViewUrl), "_blank")}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {searchedTxId && !isLoading && documents.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No documents found for this transaction.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
