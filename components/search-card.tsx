/**
 * @module SearchCard
 * @description A reusable card component for performing searches with a consistent UI.
 */

"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

/**
 * Props for the {@link SearchCard} component.
 */
interface SearchCardProps {
  /** Title of the search card. */
  title: string
  /** Description text below the title. */
  description: string
  /** Label for the search input. */
  label: string
  /** Placeholder text for the search input. */
  placeholder?: string
  /** Whether the search is currently loading. */
  isLoading?: boolean
  /** Initial value for the search input. */
  initialValue?: string
  /** Callback triggered when the search is submitted. */
  onSearch: (value: string) => void
}

/**
 * SearchCard component provides a standardized search input interface.
 *
 * @param props - {@link SearchCardProps}
 */
export function SearchCard({
  title,
  description,
  label,
  placeholder,
  isLoading = false,
  initialValue = "",
  onSearch,
}: SearchCardProps) {
  const [value, setValue] = useState(initialValue)

  const handleSubmit = () => {
    if (value.trim()) {
      onSearch(value.trim())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 items-end">
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor="search-input">{label}</Label>
            <Input
              id="search-input"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <Button onClick={handleSubmit} disabled={isLoading || !value.trim()}>
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
