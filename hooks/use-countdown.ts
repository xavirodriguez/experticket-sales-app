import { useState, useEffect } from "react"

/**
 * Data returned by the {@link useCountdown} hook.
 */
export interface CountdownResult {
  /**
   * Formatted time remaining.
   *
   * @remarks
   * Example formats: "5m 30s", "0m 15s". Returns "Expired" when the timer reaches zero.
   */
  timeLeft: string
  /** Indicates if the target timestamp has been reached or passed. */
  isExpired: boolean
  /** Indicates if the remaining time is below a certain threshold (e.g., 2 minutes). */
  isWarning: boolean
  /** Raw numeric difference in milliseconds between the target and current time. */
  diff: number
}

/**
 * Manages a real-time countdown timer.
 *
 * @remarks
 * This hook sets up an interval that updates every second. It automatically
 * handles cleanup when the component unmounts or the target changes.
 *
 * @param targetTimestamp - Unix timestamp (in milliseconds) to count down to.
 * @returns Object containing the current timer state.
 *
 * @example
 * ```tsx
 * function Timer({ expiry }) {
 *   const { timeLeft, isExpired } = useCountdown(expiry);
 *   return <div>{isExpired ? 'Too late!' : timeLeft}</div>;
 * }
 * ```
 */
export function useCountdown(targetTimestamp: number | null): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [diff, setDiff] = useState<number>(0)

  useEffect(() => {
    if (!targetTimestamp) {
      setTimeLeft("")
      setIsExpired(false)
      setIsWarning(false)
      setDiff(0)
      return
    }

    const calculateTimeLeft = (): boolean => {
      const now = Date.now()
      const currentDiff = targetTimestamp - now

      if (currentDiff <= 0) {
        setIsExpired(true)
        setIsWarning(false)
        setTimeLeft("Expired")
        setDiff(0)
        return true // should clear interval
      } else {
        const mins = Math.floor(currentDiff / 60000)
        const secs = Math.floor((currentDiff % 60000) / 1000)
        setTimeLeft(`${mins}m ${secs}s`)
        setDiff(currentDiff)
        setIsWarning(currentDiff < 120000) // Less than 2 minutes
        return false
      }
    }

    // Initial calculation
    const shouldStop = calculateTimeLeft()
    if (shouldStop) return

    const interval = setInterval(() => {
      const stopped = calculateTimeLeft()
      if (stopped) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTimestamp])

  return { timeLeft, isExpired, isWarning, diff }
}
