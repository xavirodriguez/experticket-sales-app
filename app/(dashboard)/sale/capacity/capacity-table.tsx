/**
 * @module CapacityTable
 * @description Component for displaying a list of capacity items in a table.
 */

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CapacityItem } from "@/lib/experticket/types"

/**
 * Props for the CapacityTable component.
 */
interface Props {
  /** Array of capacity items to display. */
  items: CapacityItem[]
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
              {item.ProductId || item.ProductBaseId || item.SessionId}
            </TableCell>
            <TableCell>{item.Date ? new Date(item.Date).toLocaleDateString() : "-"}</TableCell>
            <TableCell>
              <CapacityBadge available={item.AvailableCapacity} />
            </TableCell>
            <TableCell>{item.Price != null ? `${item.Price.toFixed(2)} EUR` : "-"}</TableCell>
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
 * @param props.available - The number of available units.
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
