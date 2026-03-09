/**
 * @module StepSelection
 * @description Step 1 of the sale process: Select language, date, provider, and products.
 */

"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useSelectionState } from "./selection/use-selection-state"
import { LanguageAndDateSelector } from "./selection/language-date-selector"
import { ProviderSelector } from "./selection/provider-selector"
import { ProductList } from "./selection/product-list"
import { CartSummary } from "./selection/cart-summary"
import type { SaleState } from "./use-sale-wizard"
import type { DomainLanguage, DomainProvider } from "@/lib/experticket/adapter"

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
  const {
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
  } = useSelectionState(state, updateState, onNext)

  return (
    <div className="space-y-6">
      <LanguageAndDateSelector
        language={language}
        onLanguageChange={setLanguage}
        accessDate={accessDate}
        onDateChange={setAccessDate}
        languages={languages as any}
      />

      <ProviderSelector
        providers={providers as any}
        isLoading={catalogLoading}
        selectedProvider={selectedProvider as any}
        onSelect={setSelectedProvider as any}
      />

      {selectedProvider && (
        <ProductList
          provider={selectedProvider}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
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
