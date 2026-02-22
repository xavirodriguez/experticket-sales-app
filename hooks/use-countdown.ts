/**
 * @module useCountdown
 * @description A custom hook for managing a countdown timer.
 */

"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Hook to manage a countdown timer from a future timestamp.
 *
 * @param targetTimestamp - The timestamp (ms) to count down to.
 * @returns Object containing the formatted time left, expiration status, and a reset function.
 *
 * @example
 * ```tsx
 * const { timeLeft, isExpired } = useCountdown(reservationExpiry);
 * ```
 */
export function useCountdown(targetTimestamp: number | null) {
  const [timeLeftFormatted, setTimeLeftFormatted] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)

  const calculateTimeLeft = useCallback(() => {
    if (!targetTimestamp) {
      setTimeLeftFormatted("")
      setIsExpired(false)
      return
    }

    const diff = targetTimestamp - Date.now()
    if (diff <= 0) {
      setIsExpired(true)
      setTimeLeftFormatted("Expired")
    } else {
      setIsExpired(false)
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeftFormatted(`${mins}m ${secs}s`)
    }
  }, [targetTimestamp])

  useEffect(() => {
    if (!targetTimestamp) return

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [calculateTimeLeft, targetTimestamp])

  return { timeLeft: timeLeftFormatted, isExpired }
}
