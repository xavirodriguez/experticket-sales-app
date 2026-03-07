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
 * Custom hook for managing the basic selection state.
 */
function useLocalSelectionState(state: SaleState) {
  const [selectedProvider, setSelectedProvider] = useState<CatalogProvider | undefined>(
    state.provider
  )
  const [accessDate, setAccessDate] = useState(state.accessDate)
  const [language, setLanguage] = useState(state.language)

  return {
    selectedProvider,
    setSelectedProvider,
    accessDate,
    setAccessDate,
    language,
    setLanguage,
  }
}

/**
 * Hook to synchronize the cart when the provider changes.
 */
function useCartSync(
  selectedProvider: CatalogProvider | undefined,
  stateProvider: CatalogProvider | undefined,
  setCart: (c: (CatalogProduct & { quantity: number })[]) => void
) {
  useEffect(() => {
    if (selectedProvider?.ProviderId !== stateProvider?.ProviderId) {
      setCart([])
    }
  }, [selectedProvider?.ProviderId, stateProvider?.ProviderId, setCart])
}

/**
 * Hook for handling the transition to the next step.
 */
function useSelectionNavigation(
  local: ReturnType<typeof useLocalSelectionState>,
  cart: (CatalogProduct & { quantity: number })[],
  updateState: (p: Partial<SaleState>) => void,
  onNext: () => void
) {
  const { selectedProvider, accessDate, language } = local

  return useCallback(() => {
    const context = { provider: selectedProvider, cart, accessDate }
    if (!validateSelection(context)) return
    updateState({
      language,
      provider: selectedProvider,
      selectedProducts: cart,
      accessDate,
    })
    onNext()
  }, [selectedProvider, accessDate, language, cart, updateState, onNext])
}

/**
 * Custom hook to manage the state and logic for the Step 1 (Selection) wizard.
 */
export function useSelectionState(
  state: SaleState,
  updateState: (p: Partial<SaleState>) => void,
  onNext: () => void
) {
  const local = useLocalSelectionState(state)
  const { cart, setCart, addToCart, removeFromCart } = useCart(state.selectedProducts)
  const { languages, providers, catalogLoading } = useCatalogData(local.language)
  useCartSync(local.selectedProvider, state.provider, setCart)
  const handleNext = useSelectionNavigation(local, cart, updateState, onNext)

  return { ...local, cart, addToCart, removeFromCart, languages, providers, catalogLoading, handleNext }
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
 * Context for selection validation.
 */
interface SelectionValidationContext {
  provider: CatalogProvider | undefined
  cart: unknown[]
  accessDate: string
}

/**
 * Validates the current selection before proceeding.
 */
function validateSelection({ provider, cart, accessDate }: SelectionValidationContext): boolean {
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
