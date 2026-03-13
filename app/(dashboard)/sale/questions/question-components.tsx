/**
 * @module QuestionComponents
 * @description Small UI components for the Step 4 (Questions) wizard.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Loading skeleton for the questions form.
 * @returns A JSX element.
 */
export function QuestionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

/**
 * Displays an error message related to question fetching.
 *
 * @param props - Component props including the error message.
 * @returns A JSX element.
 */
export function QuestionsError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

/**
 * View shown when no questions are required.
 *
 * @param props - Component props including navigation callbacks.
 * @returns A JSX element.
 */
export function NoQuestionsView({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No questions required for these products.</p>
        </CardContent>
      </Card>
      <StepNavigation onBack={onBack} onNext={onNext} />
    </div>
  )
}

/**
 * Navigation buttons for wizard steps.
 *
 * @param props - Component props including navigation callbacks.
 * @returns A JSX element.
 */
export function StepNavigation({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onBack}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Back
      </Button>
      <Button onClick={onNext}>
        Next: Reservation
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
