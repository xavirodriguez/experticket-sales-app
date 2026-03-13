/**
 * @module CapacityTable
 * @description Component for displaying a list of capacity items in a table.
 */

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DomainCapacityItem } from "@/lib/experticket/adapter"

/**
 * Props for the CapacityTable component.
 */
interface Props {
  /** Array of capacity items to display. */
  items: DomainCapacityItem[]
}

/**
 * Component for displaying capacity information in a table.
 *
 * @param props - {@link Props}
 * @returns A JSX element containing the capacity table.
 * @example
 * ```tsx
 * <CapacityTable items={capacityItems} />
 * ```
 */
export function CapacityTable({ items }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Available</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, idx) => (
          <TableRow key={idx}>
            <TableCell className="font-mono text-xs">
              {item.productId || item.productBaseId || item.sessionId}
            </TableCell>
            <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</TableCell>
            <TableCell>
              <CapacityBadge available={item.availableCapacity} />
            </TableCell>
            <TableCell>{item.price != null ? `${item.price.toFixed(2)} EUR` : "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Renders a badge indicating the available capacity.
 *
 * @param props - Component props.
 * @returns A JSX element containing a Badge.
 */
function CapacityBadge({ available }: { available?: number }) {
  if (available === undefined) {
    return <Badge variant="secondary">Unlimited</Badge>
  }
  return (
    <Badge variant={available > 0 ? "secondary" : "destructive"}>
      {available}
    </Badge>
  )
}
