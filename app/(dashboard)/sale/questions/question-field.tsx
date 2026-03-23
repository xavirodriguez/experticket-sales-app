/**
 * @module QuestionField
 * @description Component for rendering an individual ticket question field.
 */

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DomainTicketQuestion } from "@/lib/experticket/adapter"

/**
 * Props for the QuestionField component.
 */
interface Props {
  /** The ticket question definition. */
  question: DomainTicketQuestion
  /** The current value of the answer. */
  value: string
  /** Callback function to update the answer. */
  onChange: (val: string) => void
}

/**
 * Component for rendering a dynamic form field based on a ticket question definition.
 *
 * @param props - {@link Props}
 * @returns A JSX element containing the label and input/select field.
 * @example
 * ```tsx
 * <QuestionField question={q} value={answers[q.id]} onChange={(v) => updateAnswer(q.id, v)} />
 * ```
 */
export function QuestionField({ question, value, onChange }: Props) {
  const label = (
    <Label htmlFor={question.id}>
      {question.question || question.shortQuestion || question.id}
      {question.required && <span className="ml-1 text-destructive">*</span>}
    </Label>
  )

  if (question.values && question.values.length > 0) {
    return (
      <div className="space-y-2">
        {label}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {question.values.map((v) => (
              <SelectItem key={v.id || v.value} value={v.value || v.id || ""}>
                {v.value || v.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label}
      <Input
        id={question.id}
        type={question.dataType === "Date" ? "date" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${question.shortQuestion || "answer"}...`}
      />
    </div>
  )
}
