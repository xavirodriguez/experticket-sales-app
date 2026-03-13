/**
 * @module SalePage
 * @description Main entry point for the multi-step sale creation process.
 */

"use client"

import { StepSelection } from "./step-selection"
import { StepCapacity } from "./step-capacity"
import { StepPricing } from "./step-pricing"
import { StepQuestions } from "./step-questions"
import { StepReservation } from "./step-reservation"
import { StepTransaction } from "./step-transaction"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSaleWizard, STEPS } from "./use-sale-wizard"

/**
 * SalePage component that manages the state and navigation of the sale wizard.
 *
 * @remarks
 * - Implements a 6-step wizard: Selection → Capacity → Pricing → Questions → Reservation → Transaction.
 * - Centralizes the sale state to ensure data consistency across steps.
 * - Provides helper functions for navigation (`goNext`, `goBack`, `goTo`) and state updates.
 */
export default function SalePage() {
  const { step, state, updateState, goNext, goBack, goTo, resetSale } = useSaleWizard()

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
        {STEPS.reduce((acc, label, idx) => {
          const isSkipped = state.skippedSteps.has(idx)
          if (isSkipped) return acc

          const displayIdx = acc.length + 1
          acc.push(
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
                {displayIdx}. {label}
              </Badge>
            </button>
          )
          return acc
        }, [] as React.ReactNode[])}
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
