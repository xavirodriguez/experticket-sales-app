/**
 * @module useQuestionsState
 * @description Custom hook for managing ticket questions state and fetching.
 */

import { useState, useEffect, useCallback } from "react"
import type { SaleState } from "../use-sale-wizard"
import type { DomainTicketQuestions, DomainTicketQuestion } from "@/lib/experticket/adapter"

/**
 * Custom hook to manage the state and logic for Step 4 (Questions).
 *
 * @param state - The current global sale state.
 * @returns An object containing questions, answers, loading state, and error information.
 * @example
 * ```typescript
 * const { questions, answers, setAnswer } = useQuestionsState(state);
 * ```
 */
export function useQuestionsState(state: SaleState) {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<DomainTicketQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>(
    (state.questionAnswers as Record<string, string>) || {}
  )
  const [noQuestions, setNoQuestions] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const profileIds = collectProfileIds(state.selectedProducts)

        if (profileIds.length === 0) {
          handleNoQuestions()
          return
        }

        const data = await performFetch(state.selectedProducts, profileIds, state.language)
        handleFetchResponse(data)
      } catch {
        handleNoQuestions()
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [state.selectedProducts, state.language])

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleNoQuestions = useCallback(() => {
    setNoQuestions(true)
    setLoading(false)
  }, [])

  const handleFetchResponse = useCallback((data: DomainTicketQuestions) => {
    if (!data.success) {
      setError(data.errorMessage || "Failed to load questions")
    }

    const allQuestions = data.profiles?.flatMap((p) => p.questions || []) || []

    if (allQuestions.length === 0) {
      setNoQuestions(true)
    } else {
      setQuestions(allQuestions)
    }
  }, [])

  return {
    loading,
    questions,
    answers,
    setAnswer,
    noQuestions,
    error,
  }
}

/**
 * Extracts unique question profile IDs from the selected products.
 *
 * @param products - The list of products in the cart.
 * @returns An array of unique profile IDs.
 */
function collectProfileIds(products: SaleState["selectedProducts"]): string[] {
  const ids = products.flatMap(
    (p) =>
      p.tickets?.filter((t) => t.ticketQuestionsProfileId).map((t) => t.ticketQuestionsProfileId!) ||
      []
  )
  return [...new Set(ids)]
}

/**
 * Fetches ticket questions from the API.
 *
 * @param products - Selected products.
 * @param profileIds - Question profile IDs.
 * @param language - Language code.
 * @returns A promise that resolves to the API response.
 */
async function performFetch(
  products: SaleState["selectedProducts"],
  profileIds: string[],
  language: string
): Promise<DomainTicketQuestions> {
  const res = await fetch("/api/experticket/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ProductIds: products.map((p) => p.productId),
      TicketsQuestionsProfileIds: profileIds,
      LanguageCode: language,
    }),
  })
  return res.json()
}
