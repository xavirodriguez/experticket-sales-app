import { useState, useCallback } from "react"
import type {
  CatalogProvider,
  CatalogProduct,
  CapacityItem,
  RealTimePriceItem,
  ReservationResponse,
  Transaction,
} from "@/lib/experticket/types"

/**
 * Shared state for the entire sale wizard.
 *
 * @remarks
 * This interface holds all the data accumulated throughout the multi-step
 * checkout process, from initial selection to final transaction.
 */
export interface SaleState {
  /** ISO 639-1 two-letter language code selected for the sale. */
  language: string
  /** The provider selected in the first step. */
  provider: CatalogProvider | undefined
  /** List of products added to the cart, including their quantities. */
  selectedProducts: (CatalogProduct & { quantity: number })[]
  /** Chosen access date for the sale in ISO 8601 format. */
  accessDate: string
  /** Optional end date for venue access in ISO 8601 format. */
  accessEndDate?: string
  /** Optional session identifier if a specific time slot was selected. */
  sessionId?: string

  // Step 2
  /** Capacity data fetched for the selected products and date. */
  capacityData: CapacityItem[]

  // Step 3
  /** Real-time pricing information for the current selection. */
  pricingData: RealTimePriceItem[]

  // Step 4
  /** Answers provided for the required ticket questions, keyed by question ID. */
  questionAnswers: Record<string, unknown>

  // Step 5
  /** The reservation result from the Experticket API. */
  reservation: ReservationResponse | undefined
  /** Unix timestamp (milliseconds) indicating when the current reservation expires. */
  reservationExpiry: number | undefined

  // Step 6
  /** The final transaction details after successful creation. */
  transaction: Transaction | undefined
}

/**
 * Labels for each step of the sale wizard.
 */
export const STEPS = [
  "Selection",
  "Capacity",
  "Pricing",
  "Questions",
  "Reservation",
  "Transaction",
] as const

/**
 * Custom hook to manage the state and navigation of the sale wizard.
 *
 * @returns An object containing the current step, wizard state, and navigation helpers.
 *
 * @example
 * ```tsx
 * function SalePage() {
 *   const { step, state, goNext, goBack } = useSaleWizard();
 *   return <div>Step: {step}</div>;
 * }
 * ```
 */
export function useSaleWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<SaleState>(createInitialState())

  /**
   * Updates the wizard state with a partial state object.
   */
  const updateState = useCallback(
    (partial: Partial<SaleState>) => setState((prev) => ({ ...prev, ...partial })),
    []
  )

  /**
   * Advances to the next step in the wizard.
   */
  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), [])

  /**
   * Navigates back to the previous step in the wizard.
   */
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])

  /**
   * Navigates to a specific step by its index.
   * @param idx - The zero-based index of the target step.
   */
  const goTo = useCallback((idx: number) => setStep(idx), [])

  /**
   * Resets the entire sale wizard to its initial state and step.
   */
  const resetSale = useCallback(() => {
    setState(createInitialState())
    setStep(0)
  }, [])

  return {
    step,
    state,
    updateState,
    goNext,
    goBack,
    goTo,
    resetSale,
  }
}

/**
 * Creates the initial state for the sale wizard.
 *
 * @internal
 */
function createInitialState(): SaleState {
  return {
    language: "en",
    provider: undefined,
    selectedProducts: [],
    accessDate: "",
    capacityData: [],
    pricingData: [],
    questionAnswers: {},
    reservation: undefined,
    reservationExpiry: undefined,
    transaction: undefined,
  }
}
