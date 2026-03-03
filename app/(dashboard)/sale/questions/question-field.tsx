/**
 * @module QuestionField
 * @description Component for rendering an individual ticket question field.
 */

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TicketQuestion } from "@/lib/experticket/types"

/**
 * Props for the QuestionField component.
 */
interface Props {
  /** The ticket question definition. */
  question: TicketQuestion
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
 * <QuestionField question={q} value={answers[q.Id]} onChange={(v) => updateAnswer(q.Id, v)} />
 * ```
 */
export function QuestionField({ question, value, onChange }: Props) {
  const label = (
    <Label htmlFor={question.Id}>
      {question.Question || question.ShortQuestion || question.Id}
      {question.Required && <span className="ml-1 text-destructive">*</span>}
    </Label>
  )

  if (question.Values && question.Values.length > 0) {
    return (
      <div className="space-y-2">
        {label}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {question.Values.map((v) => (
              <SelectItem key={v.Id || v.Value} value={v.Value || v.Id || ""}>
                {v.Value || v.Id}
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
        id={question.Id}
        type={question.DataType === "Date" ? "date" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${question.ShortQuestion || "answer"}...`}
      />
    </div>
  )
}
