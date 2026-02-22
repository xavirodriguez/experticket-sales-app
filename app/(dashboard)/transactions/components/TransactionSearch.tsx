"use client"

import { SearchCard } from "@/components/experticket/SearchCard"

/**
 * Props for the {@link TransactionSearch} component.
 */
interface TransactionSearchProps {
  /** The current search ID value. */
  searchId: string
  /** Callback to update the search ID value. */
  onSearchIdChange: (value: string) => void
  /** Callback to trigger the search. */
  onSearch: () => void
  /** Whether the search is currently in progress. */
  isLoading: boolean
}

/**
 * Component for searching transactions by ID.
 *
 * @param props - Component props.
 * @returns The rendered search component.
 */
export function TransactionSearch({
  searchId,
  onSearchIdChange,
  onSearch,
  isLoading,
}: TransactionSearchProps) {
  return (
    <SearchCard
      title="Search Transactions"
      description="Enter a Transaction ID or access date range to find transactions"
      inputLabel="Transaction ID"
      inputPlaceholder="Enter transaction ID..."
      searchValue={searchId}
      onSearchValueChange={onSearchIdChange}
      onSearch={onSearch}
      isLoading={isLoading}
    />
  )
}
