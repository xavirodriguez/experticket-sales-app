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

export interface SaleState {
  language: string
  provider: CatalogProvider | null
  selectedProducts: (CatalogProduct & { quantity: number })[]
  accessDate: string
  accessEndDate?: string
  sessionId?: string
  // Step 2
  capacityData: CapacityItem[]
  // Step 3
  pricingData: RealTimePriceItem[]
  // Step 4
  questionAnswers: Record<string, unknown>
  // Step 5
  reservation: ReservationResponse | null
  reservationExpiry: number | null // timestamp
  // Step 6
  transaction: Transaction | null
}

const STEPS = [
  "Selection",
  "Capacity",
  "Pricing",
  "Questions",
  "Reservation",
  "Transaction",
] as const

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

  const updateState = useCallback(
    (partial: Partial<SaleState>) => setState((prev) => ({ ...prev, ...partial })),
    []
  )

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), [])
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])
  const goTo = useCallback((idx: number) => setStep(idx), [])

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
