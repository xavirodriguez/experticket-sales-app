"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import type { SaleState } from "./page"
import type { TicketQuestionsResponse, TicketQuestion } from "@/lib/experticket/types"

interface Props {
  state: SaleState
  updateState: (p: Partial<SaleState>) => void
  onNext: () => void
  onBack: () => void
}

export function StepQuestions({ state, updateState, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<TicketQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>(
    (state.questionAnswers as Record<string, string>) || {}
  )
  const [noQuestions, setNoQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      try {
        // Collect all TicketQuestionsProfileIds from products
        const profileIds = state.selectedProducts.flatMap(
          (p) =>
            p.Tickets?.filter((t) => t.TicketQuestionsProfileId).map(
              (t) => t.TicketQuestionsProfileId!
            ) || []
        )

        if (profileIds.length === 0) {
          setNoQuestions(true)
          setLoading(false)
          return
        }

        const res = await fetch("/api/experticket/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ProductIds: state.selectedProducts.map((p) => p.ProductId),
            TicketsQuestionsProfileIds: [...new Set(profileIds)],
            LanguageCode: state.language,
          }),
        })
        const data: TicketQuestionsResponse = await res.json()

        if (!data.Success) {
          setError(data.ErrorMessage || "Failed to load questions")
        }

        const allQuestions =
          data.TicketQuestionsProfiles?.flatMap((p) => p.Questions || []) || []

        if (allQuestions.length === 0) {
          setNoQuestions(true)
        } else {
          setQuestions(allQuestions)
        }
      } catch {
        setNoQuestions(true)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [state.selectedProducts, state.language])

  function handleNext() {
    // Validate required questions
    const missing = questions.filter((q) => q.Required && !answers[q.Id])
    if (missing.length > 0) {
      toast.error(`Please answer all required questions (${missing.length} missing)`)
      return
    }
    updateState({ questionAnswers: answers })
    onNext()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (noQuestions) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No questions required for these products.</p>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext}>
            Next: Reservation
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ticket Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q) => (
            <div key={q.Id} className="space-y-2">
              <Label htmlFor={q.Id}>
                {q.Question || q.ShortQuestion || q.Id}
                {q.Required && <span className="ml-1 text-destructive">*</span>}
              </Label>
              {q.Values && q.Values.length > 0 ? (
                <Select
                  value={answers[q.Id] || ""}
                  onValueChange={(val) => setAnswers((prev) => ({ ...prev, [q.Id]: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {q.Values.map((v) => (
                      <SelectItem key={v.Id || v.Value} value={v.Value || v.Id || ""}>
                        {v.Value || v.Id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : q.DataType === "Date" ? (
                <Input
                  id={q.Id}
                  type="date"
                  value={answers[q.Id] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.Id]: e.target.value }))}
                />
              ) : (
                <Input
                  id={q.Id}
                  value={answers[q.Id] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.Id]: e.target.value }))}
                  placeholder={`Enter ${q.ShortQuestion || "answer"}...`}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext}>
          Next: Reservation
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
