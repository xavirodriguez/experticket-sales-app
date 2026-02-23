/**
 * @module PageHeader
 * @description A reusable header component for dashboard pages.
 */

"use client"

/**
 * Props for the {@link PageHeader} component.
 */
interface PageHeaderProps {
  /** The main title of the page. */
  title: string
  /** A brief description of the page's purpose. */
  description?: string
  /** Additional CSS classes for the container. */
  className?: string
}

/**
 * PageHeader component that displays a consistent title and description.
 *
 * @param props - {@link PageHeaderProps}
 */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}
