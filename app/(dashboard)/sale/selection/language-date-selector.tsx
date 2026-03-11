import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { DomainLanguage } from "@/lib/experticket/adapter"

/**
 * Props for the LanguageAndDateSelector component.
 */
interface Props {
  language: string
  onLanguageChange: (val: string) => void
  accessDate: string
  onDateChange: (val: string) => void
  languages: DomainLanguage[]
}

/**
 * Component for selecting language and access date.
 */
export function LanguageAndDateSelector({
  language,
  onLanguageChange,
  accessDate,
  onDateChange,
  languages,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Language</Label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.englishName} ({l.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="access-date">Access Date</Label>
        <Input
          id="access-date"
          type="date"
          value={accessDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  )
}
