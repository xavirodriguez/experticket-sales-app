import { useState, useEffect } from "react"

/**
 * Defines the shape of the data returned by the {@link useCountdown} hook.
 */
export interface CountdownResult {
  /** The formatted time remaining (e.g., "5m 30s") or "Expired". */
  timeLeft: string
  /** Indicates if the target timestamp has been reached or passed. */
  isExpired: boolean
  /** The raw numeric difference in milliseconds between the target and now. */
  diff: number
}

/**
 * Custom hook to manage a real-time countdown timer.
 *
 * @remarks
 * This hook sets up an interval that updates every second. It automatically
 * handles cleanup when the component unmounts or the target changes.
 *
 * @param targetTimestamp - The unix timestamp (in milliseconds) to count down to.
 * @returns An object of type {@link CountdownResult} containing timer state.
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
  const [diff, setDiff] = useState<number>(0)

  useEffect(() => {
    if (!targetTimestamp) {
      setTimeLeft("")
      setIsExpired(false)
      setDiff(0)
      return
    }

    const calculateTimeLeft = () => {
      const now = Date.now()
      const currentDiff = targetTimestamp - now

      if (currentDiff <= 0) {
        setIsExpired(true)
        setTimeLeft("Expired")
        setDiff(0)
        return true // should clear interval
      } else {
        const mins = Math.floor(currentDiff / 60000)
        const secs = Math.floor((currentDiff % 60000) / 1000)
        setTimeLeft(`${mins}m ${secs}s`)
        setDiff(currentDiff)
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

  return { timeLeft, isExpired, diff }
}
