/**
 * @module StepSelection
 * @description Step 1 of the sale process: Select language, date, provider, and products.
 */

"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Plus, Minus, ChevronRight } from "lucide-react"
import { fetcher } from "@/lib/experticket/client"
import type { SaleState } from "./page"
import type {
  CatalogResponse,
  CatalogProvider,
  CatalogProduct,
  LanguagesResponse,
} from "@/lib/experticket/types"

/**
 * Props for the {@link StepSelection} component.
 */
interface Props {
  /** Current global sale state. */
  state: SaleState
  /** Function to update the global sale state. */
  updateState: (p: Partial<SaleState>) => void
  /** Callback to navigate to the next step. */
  onNext: () => void
}

/**
 * Component for Step 1: Selection.
 * Handles fetching the catalog and managing the shopping cart.
 *
 * @param props - {@link Props}
 *
 * @remarks
 * - Fetches available languages and the product catalog based on the selected language.
 * - Allows users to add/remove products to a local cart state.
 * - Validates that a provider, products, and a date are selected before proceeding.
 */
export function StepSelection({ state, updateState, onNext }: Props) {
  const [selectedProvider, setSelectedProvider] = useState<CatalogProvider | null>(state.provider)
  const [cart, setCart] = useState<(CatalogProduct & { quantity: number })[]>(state.selectedProducts)
  const [accessDate, setAccessDate] = useState(state.accessDate)
  const [language, setLanguage] = useState(state.language)

  // Fetch languages
  const { data: langData } = useSWR<LanguagesResponse>(
    "/api/experticket/languages",
    fetcher
  )

  // Fetch catalog
  const { data: catalogData, isLoading: catalogLoading } = useSWR<CatalogResponse>(
    `/api/experticket/catalog?LanguageCode=${language}`,
    fetcher
  )

  /**
   * List of languages, falling back to defaults if the API call fails or is empty.
   */
  const languages = langData?.Languages?.length
    ? langData.Languages
    : [
        { Code: "es", EnglishName: "Spanish", NativeName: "Espanol" },
        { Code: "en", EnglishName: "English", NativeName: "English" },
        { Code: "fr", EnglishName: "French", NativeName: "Francais" },
        { Code: "it", EnglishName: "Italian", NativeName: "Italiano" },
      ]

  /** List of providers from the catalog response. */
  const providers = catalogData?.Providers || []

  /**
   * Adds a product to the cart or increments its quantity if already present.
   * @param product - The product to add.
   */
  function addToCart(product: CatalogProduct) {
    setCart((prev) => {
      const existing = prev.find((p) => p.ProductId === product.ProductId)
      if (existing) {
        return prev.map((p) =>
          p.ProductId === product.ProductId ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  /**
   * Decrements a product's quantity in the cart or removes it if quantity reaches zero.
   * @param productId - ID of the product to remove.
   */
  function removeFromCart(productId: string) {
    setCart((prev) => {
      const existing = prev.find((p) => p.ProductId === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((p) =>
          p.ProductId === productId ? { ...p, quantity: p.quantity - 1 } : p
        )
      }
      return prev.filter((p) => p.ProductId !== productId)
    })
  }

  /**
   * Validates selections and saves them to the global state before moving to the next step.
   */
  function handleNext() {
    if (!selectedProvider) {
      toast.error("Please select a provider")
      return
    }
    if (cart.length === 0) {
      toast.error("Please add at least one product")
      return
    }
    if (!accessDate) {
      toast.error("Please select an access date")
      return
    }
    updateState({
      language,
      provider: selectedProvider,
      selectedProducts: cart,
      accessDate,
    })
    onNext()
  }

  // Reset cart when provider changes
  useEffect(() => {
    setCart([])
  }, [selectedProvider?.ProviderId])

  /** Flat list of products for the currently selected provider. */
  const products =
    selectedProvider?.ProductBases?.flatMap((pb) => pb.Products || []) || []

  return (
    <div className="space-y-6">
      {/* Language & Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l.Code} value={l.Code}>
                  {l.EnglishName} ({l.Code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="access-date">Access Date</Label>
          <Input
            id="access-date"
            type="date"
            value={accessDate}
            onChange={(e) => setAccessDate(e.target.value)}
          />
        </div>
      </div>

      {/* Provider selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Provider</CardTitle>
        </CardHeader>
        <CardContent>
          {catalogLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No providers found. Check your API configuration.
            </p>
          ) : (
            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {providers.map((prov) => (
                  <button
                    key={prov.ProviderId}
                    onClick={() => setSelectedProvider(prov)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedProvider?.ProviderId === prov.ProviderId
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div>
                      <span className="font-medium">
                        {prov.ProviderName || prov.ProviderCommercialName || prov.ProviderId}
                      </span>
                      {prov.Tags && prov.Tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {prov.Tags.map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      {selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products available for this provider.
              </p>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-2">
                  {products.map((prod) => {
                    const inCart = cart.find((c) => c.ProductId === prod.ProductId)
                    return (
                      <div
                        key={prod.ProductId}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {prod.ProductName || prod.ProductId}
                          </p>
                          {prod.Price != null && (
                            <p className="text-xs text-muted-foreground">
                              {prod.Price.toFixed(2)} EUR
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {inCart ? (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => removeFromCart(prod.ProductId)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">
                                {inCart.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => addToCart(prod)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => addToCart(prod)}>
                              <Plus className="mr-1 h-3 w-3" /> Add
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cart summary */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cart ({cart.reduce((a, c) => a + c.quantity, 0)} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {cart.map((item) => (
                <div key={item.ProductId} className="flex items-center justify-between text-sm">
                  <span>{item.ProductName || item.ProductId}</span>
                  <span className="font-medium">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedProvider || cart.length === 0 || !accessDate}>
          Next: Check Capacity
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
