/**
 * @module SalePage
 * @description Main entry point for the multi-step sale creation process.
 */

"use client"

import { useState, useCallback } from "react"
import { StepSelection } from "./step-selection"
import { StepCapacity } from "./step-capacity"
import { StepPricing } from "./step-pricing"
import { StepQuestions } from "./step-questions"
import { StepReservation } from "./step-reservation"
import { StepTransaction } from "./step-transaction"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
  provider: CatalogProvider | null
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
  reservation: ReservationResponse | null
  /** Timestamp indicating when the current reservation expires. */
  reservationExpiry: number | null

  // Step 6
  /** The final transaction details after successful creation. */
  transaction: Transaction | null
}

/**
 * Labels for each step of the sale wizard.
 */
const STEPS = [
  "Selection",
  "Capacity",
  "Pricing",
  "Questions",
  "Reservation",
  "Transaction",
] as const

/**
 * SalePage component that manages the state and navigation of the sale wizard.
 *
 * @remarks
 * - Implements a 6-step wizard: Selection → Capacity → Pricing → Questions → Reservation → Transaction.
 * - Centralizes the sale state to ensure data consistency across steps.
 * - Provides helper functions for navigation (`goNext`, `goBack`, `goTo`) and state updates.
 */
export default function SalePage() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<SaleState>({
    language: "en",
    provider: null,
    selectedProducts: [],
    accessDate: "",
    capacityData: [],
    pricingData: [],
    questionAnswers: {},
    reservation: null,
    reservationExpiry: null,
    transaction: null,
  })

  /**
   * Updates the shared sale state with a partial update.
   */
  const updateState = useCallback(
    (partial: Partial<SaleState>) => setState((prev) => ({ ...prev, ...partial })),
    []
  )

  /** Navigates to the next step. */
  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), [])
  /** Navigates to the previous step. */
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])
  /** Navigates to a specific step by index. */
  const goTo = useCallback((idx: number) => setStep(idx), [])

  /** Resets the sale state and navigates back to the first step. */
  const resetSale = useCallback(() => {
    setState({
      language: "en",
      provider: null,
      selectedProducts: [],
      accessDate: "",
      capacityData: [],
      pricingData: [],
      questionAnswers: {},
      reservation: null,
      reservationExpiry: null,
      transaction: null,
    })
    setStep(0)
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">New Sale</h1>
        <p className="text-muted-foreground">
          Follow the steps to create a new sale.
        </p>
      </div>

      {/* Step indicator */}
      <nav aria-label="Sale steps" className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, idx) => (
          <button
            key={label}
            onClick={() => idx < step && goTo(idx)}
            disabled={idx > step}
            className="flex items-center gap-1.5"
          >
            <Badge
              variant={idx === step ? "default" : idx < step ? "secondary" : "outline"}
              className={cn(
                "cursor-pointer text-xs transition-colors",
                idx > step && "opacity-50 cursor-not-allowed"
              )}
            >
              {idx + 1}. {label}
            </Badge>
          </button>
        ))}
      </nav>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 0 && (
          <StepSelection state={state} updateState={updateState} onNext={goNext} />
        )}
        {step === 1 && (
          <StepCapacity state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 2 && (
          <StepPricing state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 3 && (
          <StepQuestions state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 4 && (
          <StepReservation state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 5 && (
          <StepTransaction state={state} onReset={resetSale} />
        )}
      </div>
    </div>
  )
}
