/**
 * @module PageHeader
 * @description A reusable header component for dashboard pages.
 */

"use client"

/**
 * Defines the properties for the {@link PageHeader} component.
 */
export interface PageHeaderProps {
  /** The primary title of the page, rendered as an h1. */
  title: string
  /** An optional subtitle or description to provide more context. */
  description?: string
  /** Optional CSS class names to be applied to the container. */
  className?: string
}

/**
 * Renders a consistent page header with a title and optional description.
 *
 * @remarks
 * The title is styled with large, bold text suitable for the top of a page.
 * The description, if provided, appears directly below the title.
 *
 * @param props - The component properties.
 * @returns A JSX element representing the page header.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Sale Wizard"
 *   description="Create a new reservation by selecting products and sessions."
 * />
 * ```
 */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}
