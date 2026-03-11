"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"

/**
 * Properties for the {@link SearchCard} component.
 */
export interface SearchCardProps {
  /** Title displayed at the top of the card. */
  title: string
  /** Descriptive subtitle for the card. */
  description: string
  /** Text used as the label for the search input field. */
  inputLabel: string
  /** Placeholder text shown in the input field when empty. */
  inputPlaceholder?: string
  /** Current controlled value of the search input. */
  searchValue: string
  /** Callback triggered whenever the input value changes. */
  onSearchValueChange: (value: string) => void
  /** Callback triggered when the search button is clicked or Enter is pressed. */
  onSearch: () => void
  /** Indicates if a search operation is currently pending. */
  isLoading?: boolean
}

/**
 * Card containing a search input and an action button.
 *
 * @remarks
 * This component handles the Enter key press within the input to trigger the search.
 * The search button is automatically disabled when the input is empty or a search is loading.
 *
 * @param props - Component properties.
 * @returns JSX element representing the search card.
 *
 * @example
 * ```tsx
 * <SearchCard
 *   title="Find Transaction"
 *   description="Search for a transaction by ID or email."
 *   inputLabel="Transaction Identifier"
 *   searchValue={query}
 *   onSearchValueChange={setQuery}
 *   onSearch={handleSearch}
 * />
 * ```
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
