import { useState, useEffect } from "react"

/**
 * Custom hook to manage a countdown timer.
 *
 * @param targetTimestamp - The unix timestamp (ms) to count down to.
 * @returns An object containing the formatted time left, whether it has expired, and the raw difference.
 */
export function useCountdown(targetTimestamp: number | null) {
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
