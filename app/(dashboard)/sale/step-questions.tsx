/**
 * @module StepQuestions
 * @description Step 4 of the sale process: Collect mandatory ticket information.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useQuestionsState } from "./questions/use-questions-state"
import { QuestionField } from "./questions/question-field"
import {
  QuestionsSkeleton,
  QuestionsError,
  NoQuestionsView,
  StepNavigation,
} from "./questions/question-components"
import type { SaleState } from "./use-sale-wizard"

/**
 * Props for the {@link StepQuestions} component.
 */
interface Props {
  /** Current global sale state. */
  state: SaleState
  /** Function to update the global sale state. */
  updateState: (p: Partial<SaleState>) => void
  /** Callback to navigate to the next step. */
  onNext: () => void
  /** Callback to navigate back to the previous step. */
  onBack: () => void
}

/**
 * Component for Step 4: Questions.
 * Renders dynamic form fields based on the questions required by the selected products.
 */
export function StepQuestions({ state, updateState, onNext, onBack }: Props) {
  const { loading, questions, answers, setAnswer, noQuestions, error } = useQuestionsState(state)

  /**
   * Validates mandatory questions and proceeds.
   */
  function handleNext() {
    const missing = questions.filter((q) => q.Required && !answers[q.Id])
    if (missing.length > 0) {
      toast.error(`Please answer all required questions (${missing.length} missing)`)
      return
    }
    updateState({ questionAnswers: answers })
    onNext()
  }

  if (loading) return <QuestionsSkeleton />

  if (noQuestions) {
    return <NoQuestionsView onBack={onBack} onNext={handleNext} />
  }

  return (
    <div className="space-y-6">
      {error && <QuestionsError message={error} />}

      <Card>
        <CardHeader>
          <CardTitle>Ticket Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q) => (
            <QuestionField
              key={q.Id}
              question={q}
              value={answers[q.Id] || ""}
              onChange={(val) => setAnswer(q.Id, val)}
            />
          ))}
        </CardContent>
      </Card>

      <StepNavigation onBack={onBack} onNext={handleNext} />
    </div>
  )
}
