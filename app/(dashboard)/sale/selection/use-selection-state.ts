import { useState, useEffect, useCallback, useMemo } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { fetcher } from "@/lib/experticket/client"
import type { SaleState } from "../use-sale-wizard"
import type {
  CatalogResponse,
  CatalogProvider,
  CatalogProduct,
  LanguagesResponse,
  Language,
} from "@/lib/experticket/types"

/**
 * Custom hook to manage the shopping cart for Step 1.
 *
 * @param initialProducts - The initial list of products in the cart.
 * @returns Cart state and management functions.
 */
function useCart(initialProducts: (CatalogProduct & { quantity: number })[]) {
  const [cart, setCart] = useState(initialProducts)

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

  return { cart, setCart, addToCart, removeFromCart }
}

/**
 * Custom hook to fetch and manage catalog and language data.
 *
 * @param language - The currently selected language code.
 * @returns Catalog data, languages, and loading state.
 */
function useCatalogData(language: string) {
  const { data: langData } = useSWR<LanguagesResponse>("/api/experticket/languages", fetcher)
  const { data: catalogData, isLoading: catalogLoading } = useSWR<CatalogResponse>(
    `/api/experticket/catalog?LanguageCode=${language}`,
    fetcher
  )

  const languages = useMemo(() => resolveLanguages(langData), [langData])
  const providers = catalogData?.Providers || []

  return { languages, providers, catalogLoading }
}

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
  const [selectedProvider, setSelectedProvider] = useState<CatalogProvider | undefined>(
    state.provider
  )
  const [accessDate, setAccessDate] = useState(state.accessDate)
  const [language, setLanguage] = useState(state.language)

  const { cart, setCart, addToCart, removeFromCart } = useCart(state.selectedProducts)
  const { languages, providers, catalogLoading } = useCatalogData(language)

  useEffect(() => {
    if (selectedProvider?.ProviderId !== state.provider?.ProviderId) {
      setCart([])
    }
  }, [selectedProvider?.ProviderId, state.provider?.ProviderId, setCart])

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

/**
 * Resolves the list of languages, providing defaults if data is missing.
 */
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

/**
 * Validates the current selection before proceeding.
 */
function validateSelection(
  provider: CatalogProvider | undefined,
  cart: unknown[],
  accessDate: string
): boolean {
  const issues = [
    { condition: !provider, message: "Please select a provider" },
    { condition: cart.length === 0, message: "Please add at least one product" },
    { condition: !accessDate, message: "Please select an access date" },
  ]

  const firstIssue = issues.find((issue) => issue.condition)
  if (firstIssue) {
    toast.error(firstIssue.message)
    return false
  }

  return true
}
