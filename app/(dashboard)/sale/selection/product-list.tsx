import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import type { DomainProvider, DomainProduct } from "@/lib/experticket/adapter"

/**
 * Props for the ProductList component.
 */
interface Props {
  provider: DomainProvider
  cart: (DomainProduct & { quantity: number })[]
  onAdd: (p: DomainProduct) => void
  onRemove: (id: string) => void
}

/**
 * Component for displaying and adding/removing products from a provider.
 */
export function ProductList({
  provider,
  cart,
  onAdd,
  onRemove,
}: Props) {
  const products = provider.productBases?.flatMap((pb) => pb.products || []) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products available for this provider.</p>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-2">
              {products.map((prod) => (
                <ProductItem
                  key={prod.productId}
                  product={prod}
                  itemInCart={cart.find((c) => c.productId === prod.productId)}
                  onAdd={() => onAdd(prod)}
                  onRemove={() => onRemove(prod.productId)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function ProductItem({
  product,
  itemInCart,
  onAdd,
  onRemove,
}: {
  product: DomainProduct
  itemInCart?: { quantity: number }
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <div className="flex-1">
        <p className="text-sm font-medium">{product.productName || product.productId}</p>
        {product.price != null && (
          <p className="text-xs text-muted-foreground">{product.price.toFixed(2)} EUR</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {itemInCart ? (
          <>
            <Button size="icon" variant="outline" className="h-7 w-7" onClick={onRemove}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{itemInCart.quantity}</span>
            <Button size="icon" variant="outline" className="h-7 w-7" onClick={onAdd}>
              <Plus className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={onAdd}>
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button>
        )}
      </div>
    </div>
  )
}
