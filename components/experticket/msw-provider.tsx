/**
 * @module MswProvider
 * @description Ensures MSW is initialized in the browser during development before the app renders.
 */

"use client"

import { useEffect, useState } from "react"

/**
 * Provider that initializes Mock Service Worker in the browser.
 */
export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function initMsw() {
      if (
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_API_MOCKING === "enabled" &&
        typeof window !== "undefined"
      ) {
        const { worker } = await import("@/mocks/browser")
        await worker.start({
          onUnhandledRequest: "bypass",
        })
      }
      setReady(true)
    }

    initMsw()
  }, [])

  if (!ready) {
    return undefined
  }

  return <>{children}</>
}
