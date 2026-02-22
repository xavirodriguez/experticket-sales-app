/**
 * @module ConfigPage
 * @description Configuration page for managing API connection settings and test mode.
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, Wifi, Settings2 } from "lucide-react"
import { toast } from "sonner"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"

/**
 * Main Configuration Page component.
 * Provides tools to check the API connection health and toggle "Test Mode".
 */
export default function ConfigPage() {
  const [isTest, setIsTest] = useLocalStorage(LOCAL_STORAGE_KEYS.IS_TEST, false)
  const [localPartnerId, setLocalPartnerId] = useState("")
  const [localLanguage, setLocalLanguage] = useState("en")
  const [advancedMode, setAdvancedMode] = useState(false)
  const [checking, setChecking] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean
    message: string
    timestamp?: string
  } | null>(null)

  /**
   * Performs a health check by calling the lastupdated API endpoint.
   */
  async function checkConnection() {
    setChecking(true)
    setConnectionResult(null)
    try {
      const res = await fetch("/api/experticket/lastupdated")
      const data = await res.json()
      if (data.Success) {
        setConnectionResult({
          success: true,
          message: "Connection successful",
          timestamp: data.LastUpdatedDateTime || data.Timestamp,
        })
        toast.success("Connection to Experticket API is healthy")
      } else {
        setConnectionResult({
          success: false,
          message: data.ErrorMessage || "Connection failed",
        })
        toast.error(data.ErrorMessage || "Connection check failed")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error"
      setConnectionResult({ success: false, message: msg })
      toast.error(msg)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Configuration</h1>
        <p className="text-muted-foreground">
          Manage your Experticket API connection settings.
        </p>
      </div>

      {/* Connection status card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Verify your Experticket API connection is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">EXPERTICKET_BASE_URL</Badge>
            <Badge variant="secondary">EXPERTICKET_PARTNER_ID</Badge>
            <Badge variant="secondary">EXPERTICKET_API_KEY</Badge>
            <span className="text-sm text-muted-foreground">
              Set via environment variables
            </span>
          </div>

          <Button onClick={checkConnection} disabled={checking}>
            {checking ? "Checking..." : "Check Connection"}
          </Button>

          {checking && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          )}

          {connectionResult && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                connectionResult.success
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {connectionResult.success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <div>
                <p className="font-medium">{connectionResult.message}</p>
                {connectionResult.timestamp && (
                  <p className="mt-1 text-sm opacity-80">
                    Last catalog update: {new Date(connectionResult.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Test Mode</CardTitle>
          <CardDescription>
            When enabled, API calls include IsTest=true. No real actions are performed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              id="is-test"
              checked={isTest}
              onCheckedChange={(val) => {
                setIsTest(val)
                toast.info(val ? "Test mode enabled" : "Test mode disabled")
              }}
            />
            <Label htmlFor="is-test" className="cursor-pointer">
              {isTest ? "Test Mode ON" : "Test Mode OFF"}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Override environment defaults for this session only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="advanced-mode"
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
            />
            <Label htmlFor="advanced-mode" className="cursor-pointer">
              Enable advanced mode
            </Label>
          </div>

          {advancedMode && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="partner-id">Partner ID (override)</Label>
                <Input
                  id="partner-id"
                  placeholder="Leave empty to use env variable"
                  value={localPartnerId}
                  onChange={(e) => setLocalPartnerId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Input
                  id="language"
                  placeholder="en"
                  value={localLanguage}
                  onChange={(e) => setLocalLanguage(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                These overrides are session-only and do not persist after refresh. For production use,
                set EXPERTICKET_PARTNER_ID and EXPERTICKET_DEFAULT_LANGUAGE as environment variables.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
