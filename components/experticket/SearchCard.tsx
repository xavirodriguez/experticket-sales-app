/**
 * @module SearchCard
 * @description A reusable search component contained within a card.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2 } from "lucide-react"

/**
 * Defines the properties for the {@link SearchCard} component.
 */
export interface SearchCardProps {
  /** The title displayed at the top of the card. */
  title: string
  /** A descriptive subtitle for the card. */
  description: string
  /** The text used as the label for the search input field. */
  inputLabel: string
  /** The placeholder text shown in the input field when empty. */
  inputPlaceholder?: string
  /** The current controlled value of the search input. */
  searchValue: string
  /** Callback function triggered whenever the input value changes. */
  onSearchValueChange: (value: string) => void
  /** Callback function triggered when the search button is clicked or Enter is pressed. */
  onSearch: () => void
  /** Indicates if a search operation is currently pending. */
  isLoading?: boolean
}

/**
 * Renders a card containing a search input and an action button.
 *
 * @remarks
 * This component handles the Enter key press within the input to trigger the search.
 * The search button is automatically disabled when the input is empty or a search is loading.
 *
 * @param props - The component properties.
 * @returns A JSX element representing the search card.
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
