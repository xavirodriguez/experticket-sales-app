/**
 * @module AppShell
 * @description The main layout wrapper for the application, providing navigation and a responsive container.
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShoppingCart,
  List,
  FileText,
  QrCode,
  XCircle,
  Settings,
  Ticket,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

/**
 * Navigation item configuration.
 */
const navItems = [
  { href: "/sale", label: "New Sale", icon: ShoppingCart },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/codes", label: "Access Codes", icon: QrCode },
  { href: "/cancellations", label: "Cancellations", icon: XCircle },
  { href: "/config", label: "Configuration", icon: Settings },
]

/**
 * AppShell component that renders the top navigation bar and a mobile drawer.
 *
 * @param props - Contains the `children` to be rendered within the main content area.
 *
 * @remarks
 * - It uses a sticky header and a responsive navigation system.
 * - Mobile navigation is handled via a state-controlled drawer.
 * - Active links are highlighted based on the current pathname.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">Experticket</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <nav
            className="absolute left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  )
}
