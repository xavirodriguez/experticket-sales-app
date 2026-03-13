import { useState, useCallback, useEffect, useRef } from "react"
import type {
  DomainProvider,
  DomainProduct,
  DomainCapacityItem,
  DomainRealTimePrice,
  DomainReservation,
  DomainTransaction,
} from "@/lib/experticket/adapter"

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
  /** The provider selected in Step 1. */
  provider: DomainProvider | undefined
  /** List of products added to the cart, including their quantities. */
  selectedProducts: (DomainProduct & { quantity: number })[]
  /** Chosen access date for the sale. */
  accessDate: string
  /** Optional end date for venue access in ISO 8601 format. */
  accessEndDate?: string
  /** Optional session identifier if a specific time slot was selected. */
  sessionId?: string

  // Step 2
  /** Capacity data fetched for the selected products and date. */
  capacityData: DomainCapacityItem[]

  // Step 3
  /** Real-time pricing information. */
  pricingData: DomainRealTimePrice[]

  // Step 4
  /** Answers provided for the required ticket questions, keyed by question ID. */
  questionAnswers: Record<string, unknown>

  // Step 5
  /** The reservation result from the Experticket API. */
  reservation: DomainReservation | undefined
  /** Timestamp indicating when the current reservation expires. */
  reservationExpiry: number | undefined

  // Step 6
  /** The final transaction details after successful creation. */
  transaction: DomainTransaction | undefined

  /** Steps that should be skipped based on current selection. */
  skippedSteps: Set<number>
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
   * Advances to the next step in the wizard, skipping those that aren't needed.
   */
  const goNext = useCallback(() => {
    setStep((current) => {
      let next = current + 1
      while (next < STEPS.length - 1 && state.skippedSteps.has(next)) {
        next++
      }
      return Math.min(next, STEPS.length - 1)
    })
  }, [state.skippedSteps])

  /**
   * Navigates back to the previous step in the wizard, skipping那些 marked as skipped.
   */
  const goBack = useCallback(() => {
    setStep((current) => {
      let prev = current - 1
      while (prev > 0 && state.skippedSteps.has(prev)) {
        prev--
      }
      return Math.max(prev, 0)
    })
  }, [state.skippedSteps])

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

  // Reservation cleanup logic
  const lastReservationId = useRef<string | undefined>(undefined)

  useEffect(() => {
    lastReservationId.current = state.reservation?.reservationId
  }, [state.reservation?.reservationId])

  useEffect(() => {
    return () => {
      const resId = lastReservationId.current
      // Only delete if we have a reservation but NO transaction was completed
      if (resId && !state.transaction) {
        fetch("/api/experticket/reservation", {
          method: "DELETE",
          body: JSON.stringify({ ReservationId: resId }),
          headers: { "Content-Type": "application/json" },
        }).catch(() => {
          // Silent catch for cleanup on unmount
        })
      }
    }
  }, [state.transaction])

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
    skippedSteps: new Set(),
  }
}
