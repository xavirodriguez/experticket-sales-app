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
 */
export interface SaleState {
  /** Selected language code for the sale. */
  language: string
  /** The provider selected in Step 1. */
  provider: CatalogProvider | undefined
  /** List of products added to the cart, including their quantities. */
  selectedProducts: (CatalogProduct & { quantity: number })[]
  /** Chosen access date for the sale. */
  accessDate: string
  /** Optional end date for access. */
  accessEndDate?: string
  /** Optional session identifier. */
  sessionId?: string

  // Step 2
  /** Capacity data fetched for the selected products and date. */
  capacityData: CapacityItem[]

  // Step 3
  /** Real-time pricing information. */
  pricingData: RealTimePriceItem[]

  // Step 4
  /** Answers provided for the required ticket questions. */
  questionAnswers: Record<string, unknown>

  // Step 5
  /** The reservation result from the Experticket API. */
  reservation: ReservationResponse | undefined
  /** Timestamp indicating when the current reservation expires. */
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
 */
export function useSaleWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<SaleState>(createInitialState())

  const updateState = useCallback(
    (partial: Partial<SaleState>) => setState((prev) => ({ ...prev, ...partial })),
    []
  )

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), [])
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])
  const goTo = useCallback((idx: number) => setStep(idx), [])

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
