import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CatalogProduct } from "@/lib/experticket/types"

/**
 * Props for the CartSummary component.
 */
interface Props {
  cart: (CatalogProduct & { quantity: number })[]
}

/**
 * Component for displaying a summary of items in the cart.
 */
export function CartSummary({ cart }: Props) {
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart ({totalItems} items)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {cart.map((item) => (
            <div key={item.ProductId} className="flex items-center justify-between text-sm">
              <span>{item.ProductName || item.ProductId}</span>
              <span className="font-medium">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
