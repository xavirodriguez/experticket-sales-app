"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"

/**
 * Props for the {@link SearchCard} component.
 */
interface SearchCardProps {
  /** Title of the search card. */
  title: string
  /** Description for the search card. */
  description: string
  /** Label for the search input. */
  inputLabel: string
  /** Placeholder for the search input. */
  inputPlaceholder?: string
  /** Current value of the search input. */
  searchValue: string
  /** Callback triggered when the search value changes. */
  onSearchValueChange: (value: string) => void
  /** Callback triggered when the search is initiated. */
  onSearch: () => void
  /** Whether a search is currently in progress. */
  isLoading?: boolean
}

/**
 * A reusable search card component with a title, description, and an input with a search button.
 *
 * @param props - Component props.
 * @returns The rendered search card.
 */
export function SearchCard({
  title,
  description,
  inputLabel,
  inputPlaceholder = "Enter value...",
  searchValue,
  onSearchValueChange,
  onSearch,
  isLoading = false,
}: SearchCardProps) {
  const isSearchDisabled = isLoading || !searchValue.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 items-end">
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor="search-input">{inputLabel}</Label>
            <Input
              id="search-input"
              placeholder={inputPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
          <Button onClick={onSearch} disabled={isSearchDisabled}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
