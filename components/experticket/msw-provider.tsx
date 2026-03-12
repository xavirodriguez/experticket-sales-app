"use client"

import { useEffect, useState } from "react"

/**
 * Component that initializes Mock Service Worker (MSW) in the browser during development.
 *
 * @remarks
 * This provider ensures that MSW is fully ready before the rest of the application
 * performs any client-side data fetching (e.g., via SWR). It only activates when
 * `process.env.NEXT_PUBLIC_API_MOCKING` is set to `"enabled"` and the environment
 * is `"development"`.
 *
 * @param props - Component properties.
 *
 * @example
 * ```tsx
 * <MswProvider>
 *   <App />
 * </MswProvider>
 * ```
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
