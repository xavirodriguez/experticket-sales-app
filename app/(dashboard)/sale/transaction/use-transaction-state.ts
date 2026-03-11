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
 * Custom hook to manage the core actions and state for Step 6 (Transaction).
 *
 * @internal
 */
function useTransactionActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const handleSuccess = useCallback((data: DomainTransaction, setTransaction: (tx: DomainTransaction) => void) => {
    setTransaction(data)
    const id = data.saleId || data.transactionId || "OK"
    toast.success(`Transaction created: ${id}`)
  }, [])

  const handleError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : "Network error"
    setError(msg)
    toast.error(msg)
  }, [])

  return { loading, setLoading, error, setError, handleSuccess, handleError }
}

/**
 * Custom hook to manage the state and logic for Step 6 (Transaction).
 *
 * @param state - The current global sale state.
 * @returns An object containing transaction state, loading state, and creation logic.
 */
export function useTransactionState(state: SaleState) {
  const { loading, setLoading, error, setError, handleSuccess, handleError } = useTransactionActions()
  const [transaction, setTransaction] = useState<DomainTransaction | undefined>(state.transaction)
  const [paymentRef, setPaymentRef] = useState("")

  const createTransaction = useCallback(async () => {
    if (!state.reservation?.reservationId) return toast.error("No valid reservation found")
    setLoading(true)
    setError(undefined)
    try {
      const payload = buildTransactionPayload(state, paymentRef)
      handleSuccess(await performTransactionRequest(payload), setTransaction)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [state, paymentRef, handleSuccess, handleError, setLoading, setError])

  return { loading, transaction, error, paymentRef, setPaymentRef, createTransaction }
}

/**
 * Executes the transaction request to the API.
 */
async function performTransactionRequest(payload: Record<string, unknown>): Promise<DomainTransaction> {
  const res = await apiFetch("/api/experticket/transaction", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return res.json()
}

/**
 * Builds the payload for the transaction API request.
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
