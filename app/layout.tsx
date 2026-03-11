import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { MswProvider } from "@/components/experticket/msw-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Experticket Sales Manager",
  description: "Manage Experticket ticketing sales, transactions, and cancellations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <MswProvider>
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
        </MswProvider>
      </body>
    </html>
  )
}
