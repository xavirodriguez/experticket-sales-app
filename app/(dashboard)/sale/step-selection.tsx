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
  Language,
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
 */
export function StepSelection({ state, updateState, onNext }: Props) {
  const [selectedProvider, setSelectedProvider] = useState<CatalogProvider | null>(state.provider)
  const [cart, setCart] = useState<(CatalogProduct & { quantity: number })[]>(state.selectedProducts)
  const [accessDate, setAccessDate] = useState(state.accessDate)
  const [language, setLanguage] = useState(state.language)

  const { data: langData } = useSWR<LanguagesResponse>("/api/experticket/languages", fetcher)
  const { data: catalogData, isLoading: catalogLoading } = useSWR<CatalogResponse>(
    `/api/experticket/catalog?LanguageCode=${language}`,
    fetcher
  )

  const languages = resolveLanguages(langData)
  const providers = catalogData?.Providers || []

  // Reset cart when provider changes
  useEffect(() => {
    setCart([])
  }, [selectedProvider?.ProviderId])

  /**
   * Validates selections and saves them to the global state before moving to the next step.
   */
  function handleNext() {
    if (!validateSelection(selectedProvider, cart, accessDate)) return

    updateState({
      language,
      provider: selectedProvider,
      selectedProducts: cart,
      accessDate,
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <LanguageAndDateSelector
        language={language}
        onLanguageChange={setLanguage}
        accessDate={accessDate}
        onDateChange={setAccessDate}
        languages={languages}
      />

      <ProviderSelector
        providers={providers}
        isLoading={catalogLoading}
        selectedProvider={selectedProvider}
        onSelect={setSelectedProvider}
      />

      {selectedProvider && (
        <ProductList
          provider={selectedProvider}
          cart={cart}
          onAdd={(p) => setCart((prev) => addToCart(prev, p))}
          onRemove={(id) => setCart((prev) => removeFromCart(prev, id))}
        />
      )}

      {cart.length > 0 && <CartSummary cart={cart} />}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedProvider || cart.length === 0 || !accessDate}
        >
          Next: Check Capacity
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// --- Sub-components ---

function LanguageAndDateSelector({
  language,
  onLanguageChange,
  accessDate,
  onDateChange,
  languages,
}: {
  language: string
  onLanguageChange: (val: string) => void
  accessDate: string
  onDateChange: (val: string) => void
  languages: Language[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Language</Label>
        <Select value={language} onValueChange={onLanguageChange}>
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
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function ProviderSelector({
  providers,
  isLoading,
  selectedProvider,
  onSelect,
}: {
  providers: CatalogProvider[]
  isLoading: boolean
  selectedProvider: CatalogProvider | null
  onSelect: (p: CatalogProvider) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Provider</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ProviderSkeleton />
        ) : providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No providers found. Check your API configuration.
          </p>
        ) : (
          <ScrollArea className="max-h-60">
            <div className="space-y-1">
              {providers.map((prov) => (
                <ProviderItem
                  key={prov.ProviderId}
                  provider={prov}
                  isSelected={selectedProvider?.ProviderId === prov.ProviderId}
                  onSelect={() => onSelect(prov)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function ProviderItem({
  provider,
  isSelected,
  onSelect,
}: {
  provider: CatalogProvider
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
      }`}
    >
      <div>
        <span className="font-medium">
          {provider.ProviderName || provider.ProviderCommercialName || provider.ProviderId}
        </span>
        {provider.Tags && provider.Tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {provider.Tags.map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
    </button>
  )
}

function ProductList({
  provider,
  cart,
  onAdd,
  onRemove,
}: {
  provider: CatalogProvider
  cart: (CatalogProduct & { quantity: number })[]
  onAdd: (p: CatalogProduct) => void
  onRemove: (id: string) => void
}) {
  const products = provider.ProductBases?.flatMap((pb) => pb.Products || []) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products available for this provider.</p>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-2">
              {products.map((prod) => (
                <ProductItem
                  key={prod.ProductId}
                  product={prod}
                  itemInCart={cart.find((c) => c.ProductId === prod.ProductId)}
                  onAdd={() => onAdd(prod)}
                  onRemove={() => onRemove(prod.ProductId)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function ProductItem({
  product,
  itemInCart,
  onAdd,
  onRemove,
}: {
  product: CatalogProduct
  itemInCart?: { quantity: number }
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <div className="flex-1">
        <p className="text-sm font-medium">{product.ProductName || product.ProductId}</p>
        {product.Price != null && (
          <p className="text-xs text-muted-foreground">{product.Price.toFixed(2)} EUR</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {itemInCart ? (
          <>
            <Button size="icon" variant="outline" className="h-7 w-7" onClick={onRemove}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{itemInCart.quantity}</span>
            <Button size="icon" variant="outline" className="h-7 w-7" onClick={onAdd}>
              <Plus className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={onAdd}>
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button>
        )}
      </div>
    </div>
  )
}

function CartSummary({ cart }: { cart: (CatalogProduct & { quantity: number })[] }) {
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart ({totalItems} items)</CardTitle>
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
  )
}

function ProviderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

// --- Helper Functions ---

function resolveLanguages(langData?: LanguagesResponse): Language[] {
  if (langData?.Languages?.length) {
    return langData.Languages
  }
  return [
    { Code: "es", EnglishName: "Spanish", NativeName: "Espanol" },
    { Code: "en", EnglishName: "English", NativeName: "English" },
    { Code: "fr", EnglishName: "French", NativeName: "Francais" },
    { Code: "it", EnglishName: "Italian", NativeName: "Italiano" },
  ]
}

function addToCart(
  prev: (CatalogProduct & { quantity: number })[],
  product: CatalogProduct
): (CatalogProduct & { quantity: number })[] {
  const existing = prev.find((p) => p.ProductId === product.ProductId)
  if (existing) {
    return prev.map((p) => (p.ProductId === product.ProductId ? { ...p, quantity: p.quantity + 1 } : p))
  }
  return [...prev, { ...product, quantity: 1 }]
}

function removeFromCart(
  prev: (CatalogProduct & { quantity: number })[],
  productId: string
): (CatalogProduct & { quantity: number })[] {
  const existing = prev.find((p) => p.ProductId === productId)
  if (existing && existing.quantity > 1) {
    return prev.map((p) => (p.ProductId === productId ? { ...p, quantity: p.quantity - 1 } : p))
  }
  return prev.filter((p) => p.ProductId !== productId)
}

function validateSelection(
  provider: CatalogProvider | null,
  cart: unknown[],
  accessDate: string
): boolean {
  if (!provider) {
    toast.error("Please select a provider")
    return false
  }
  if (cart.length === 0) {
    toast.error("Please add at least one product")
    return false
  }
  if (!accessDate) {
    toast.error("Please select an access date")
    return false
  }
  return true
}
