/**
 * @module PageHeader
 * @description A shared header component for dashboard pages.
 */

import React from "react"

/**
 * Props for the {@link PageHeader} component.
 */
interface PageHeaderProps {
  /** The main title of the page. */
  title: string
  /** A brief description or subtitle for the page. */
  description: string
}

/**
 * Renders a consistent page header with a title and description.
 *
 * @param props - Component props.
 * @returns The rendered page header.
 */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
