"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, AlertCircle, QrCode, Copy, Check } from "lucide-react"
import { fetcher } from "@/lib/experticket/client"

export default function AccessCodesPage() {
  const [txId, setTxId] = useState("")
  const [searchedTxId, setSearchedTxId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data, isLoading, error } = useSWR(
    searchedTxId ? `/api/experticket/accesscodes?SaleId=${encodeURIComponent(searchedTxId)}` : null,
    fetcher
  )

  function handleSearch() {
    if (!txId.trim()) return
    setSearchedTxId(txId.trim())
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const codes: Record<string, unknown>[] = data
    ? Array.isArray(data) ? data : data.AccessCodes ? data.AccessCodes : data.Codes ? data.Codes : [data]
    : []

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Codes</h1>
        <p className="text-muted-foreground mt-1">Retrieve QR codes and access codes for tickets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Access Codes</CardTitle>
          <CardDescription>Enter a Transaction ID to retrieve access codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="codeTxId">Transaction ID</Label>
              <Input
                id="codeTxId"
                placeholder="Enter transaction ID..."
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !txId.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

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
                        <Badge
                          className={
                            String(code.Status || "").toLowerCase().includes("active") ||
                            String(code.Status || "").toLowerCase().includes("valid")
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }
                        >
                          {String(code.Status || "Active")}
                        </Badge>
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
