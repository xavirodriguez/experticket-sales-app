"use client"

/**
 * Properties for the {@link PageHeader} component.
 */
export interface PageHeaderProps {
  /** Primary title of the page, rendered as an h1. */
  title: string
  /** Optional subtitle or description to provide more context. */
  description?: string
  /** Optional CSS class names to be applied to the container. */
  className?: string
}

/**
 * Consistent page header with a title and optional description.
 *
 * @remarks
 * The title is styled with large, bold text suitable for the top of a page.
 * The description, if provided, appears directly below the title.
 *
 * @param props - Component properties.
 * @returns JSX element representing the page header.
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
