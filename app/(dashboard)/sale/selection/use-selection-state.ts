import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { fetcher } from "@/lib/experticket/client"
import type { SaleState } from "../page"
import type {
  CatalogResponse,
  CatalogProvider,
  CatalogProduct,
  LanguagesResponse,
  Language,
} from "@/lib/experticket/types"

/**
 * Custom hook to manage the state and logic for the Step 1 (Selection) wizard.
 *
 * @param state - The current global sale state.
 * @param updateState - Function to update the global sale state.
 * @param onNext - Callback to move to the next step.
 * @returns An object containing the current state and handler functions.
 */
export function useSelectionState(
  state: SaleState,
  updateState: (p: Partial<SaleState>) => void,
  onNext: () => void
) {
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

  useEffect(() => {
    if (selectedProvider?.ProviderId !== state.provider?.ProviderId) {
      setCart([])
    }
  }, [selectedProvider?.ProviderId, state.provider?.ProviderId])

  const addToCart = useCallback((product: CatalogProduct) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.ProductId === product.ProductId)
      if (existing) {
        return prev.map((p) =>
          p.ProductId === product.ProductId ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.ProductId === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((p) => (p.ProductId === productId ? { ...p, quantity: p.quantity - 1 } : p))
      }
      return prev.filter((p) => p.ProductId !== productId)
    })
  }, [])

  const handleNext = useCallback(() => {
    if (!validateSelection(selectedProvider, cart, accessDate)) return

    updateState({
      language,
      provider: selectedProvider,
      selectedProducts: cart,
      accessDate,
    })
    onNext()
  }, [selectedProvider, cart, accessDate, language, updateState, onNext])

  return {
    language,
    setLanguage,
    accessDate,
    setAccessDate,
    selectedProvider,
    setSelectedProvider,
    cart,
    addToCart,
    removeFromCart,
    languages,
    providers,
    catalogLoading,
    handleNext,
  }
}

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
