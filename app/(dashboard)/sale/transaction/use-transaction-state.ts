/**
 * @module useTransactionState
 * @description Custom hook for managing transaction state and finalization logic.
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/experticket/client"
import { getIsTestMode } from "@/lib/experticket/storage"
import type { SaleState } from "../use-sale-wizard"
import type { DomainTransaction } from "@/lib/experticket/adapter"

/**
 * Custom hook to manage the state and logic for Step 6 (Transaction).
 *
 * @param state - The current global sale state.
 * @returns An object containing transaction state, loading state, and creation logic.
 * @example
 * ```typescript
 * const { transaction, createTransaction, loading } = useTransactionState(state);
 * ```
 */
export function useTransactionState(state: SaleState) {
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<DomainTransaction | undefined>(state.transaction)
  const [error, setError] = useState<string | undefined>(undefined)
  const [paymentRef, setPaymentRef] = useState("")

  const createTransaction = useCallback(async () => {
    if (!state.reservation?.reservationId) {
      toast.error("No valid reservation found")
      return
    }
    setLoading(true)
    setError(undefined)

    try {
      const payload = buildTransactionPayload(state, paymentRef)
      const res = await apiFetch("/api/experticket/transaction", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const data: DomainTransaction = await res.json()

      // The DomainTransaction object itself represents the result of the normalization
      // which is usually only done if Success was true. But we check anyway.
      // Wait, adaptTransaction doesn't have Success, but the DomainTransactionList might.
      // Actually, createTransaction (Service) returns DomainTransaction.
      // If we are calling the API route /api/experticket/transaction (POST),
      // it returns what experticketService.createTransaction returns,
      // which is a DomainTransaction.

      setTransaction(data)
      toast.success(`Transaction created: ${data.saleId || data.transactionId || "OK"}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [state, paymentRef])

  return {
    loading,
    transaction,
    error,
    paymentRef,
    setPaymentRef,
    createTransaction,
  }
}

/**
 * Builds the payload for the transaction API request.
 *
 * @param state - The current sale state.
 * @param paymentRef - Optional external payment reference.
 * @returns The request payload.
 */
function buildTransactionPayload(state: SaleState, paymentRef: string) {
  const payload: Record<string, unknown> = {
    IsTest: getIsTestMode(),
    ReservationId: state.reservation?.reservationId,
    AccessDateTime: `${state.accessDate}T00:00:00`,
    Products: state.selectedProducts.map((p) => ({ ProductId: p.productId })),
  }

  if (paymentRef.trim()) {
    payload.PartnerSaleId = paymentRef.trim()
  }

  return payload
}
