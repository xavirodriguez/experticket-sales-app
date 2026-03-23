import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/experticket/utils"
import type { DomainProduct } from "@/lib/experticket/adapter"

/**
 * Props for the CartSummary component.
 */
interface Props {
  cart: (DomainProduct & { quantity: number })[]
}

/**
 * Component for displaying a summary of items in the cart.
 */
export function CartSummary({ cart }: Props) {
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalPrice = cart.reduce((acc, curr) => acc + (curr.price || 0) * curr.quantity, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart ({totalItems} items)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span>{item.productName || item.productId}</span>
                {item.price != null && (
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(item.price)} each
                  </span>
                )}
              </div>
              <span className="font-medium">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </CardContent>
      {cart.length > 0 && (
        <>
          <Separator />
          <CardFooter className="flex items-center justify-between py-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(totalPrice)}
            </span>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
