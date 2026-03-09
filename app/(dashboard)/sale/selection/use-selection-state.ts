import { useState, useEffect, useCallback, useMemo } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { fetcher } from "@/lib/experticket/client"
import type { SaleState } from "../use-sale-wizard"
import type {
  DomainCatalog,
  DomainProvider,
  DomainProduct,
  DomainLanguages,
  DomainLanguage,
} from "@/lib/experticket/adapter"

/**
 * Custom hook to manage the shopping cart for Step 1.
 *
 * @param initialProducts - The initial list of products in the cart.
 * @returns Cart state and management functions.
 */
function useCart(initialProducts: (DomainProduct & { quantity: number })[]) {
  const [cart, setCart] = useState(initialProducts)

  const addToCart = useCallback((product: DomainProduct) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.productId === product.productId)
      if (existing) {
        return prev.map((p) =>
          p.productId === product.productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.productId === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((p) => (p.productId === productId ? { ...p, quantity: p.quantity - 1 } : p))
      }
      return prev.filter((p) => p.productId !== productId)
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
  const { data: langData } = useSWR<DomainLanguages>("/api/experticket/languages", fetcher)
  const { data: catalogData, isLoading: catalogLoading } = useSWR<DomainCatalog>(
    `/api/experticket/catalog?LanguageCode=${language}`,
    fetcher
  )

  const languages = useMemo(() => resolveLanguages(langData), [langData])
  const providers = catalogData?.providers || []

  return { languages, providers, catalogLoading }
}

/**
 * Custom hook for managing the basic selection state.
 */
function useLocalSelectionState(state: SaleState) {
  const [selectedProvider, setSelectedProvider] = useState<DomainProvider | undefined>(
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
  selectedProvider: DomainProvider | undefined,
  stateProvider: DomainProvider | undefined,
  setCart: (c: (DomainProduct & { quantity: number })[]) => void
) {
  useEffect(() => {
    if (selectedProvider?.providerId !== stateProvider?.providerId) {
      setCart([])
    }
  }, [selectedProvider?.providerId, stateProvider?.providerId, setCart])
}

/**
 * Hook for handling the transition to the next step.
 */
function useSelectionNavigation(
  local: ReturnType<typeof useLocalSelectionState>,
  cart: (DomainProduct & { quantity: number })[],
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
function resolveLanguages(langData?: DomainLanguages): DomainLanguage[] {
  if (langData?.languages?.length) {
    return langData.languages
  }
  return [
    { code: "es", englishName: "Spanish", nativeName: "Espanol" },
    { code: "en", englishName: "English", nativeName: "English" },
    { code: "fr", englishName: "French", nativeName: "Francais" },
    { code: "it", englishName: "Italian", nativeName: "Italiano" },
  ]
}

/**
 * Context for selection validation.
 */
interface SelectionValidationContext {
  provider: DomainProvider | undefined
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
