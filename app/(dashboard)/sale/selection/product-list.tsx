import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import type { CatalogProvider, CatalogProduct } from "@/lib/experticket/types"

/**
 * Props for the ProductList component.
 */
interface Props {
  provider: CatalogProvider
  cart: (CatalogProduct & { quantity: number })[]
  onAdd: (p: CatalogProduct) => void
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
  const products = provider.ProductBases?.flatMap((pb) => pb.Products || []) || []

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
                  key={prod.ProductId}
                  product={prod}
                  itemInCart={cart.find((c) => c.ProductId === prod.ProductId)}
                  onAdd={() => onAdd(prod)}
                  onRemove={() => onRemove(prod.ProductId)}
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
  product: CatalogProduct
  itemInCart?: { quantity: number }
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <div className="flex-1">
        <p className="text-sm font-medium">{product.ProductName || product.ProductId}</p>
        {product.Price != null && (
          <p className="text-xs text-muted-foreground">{product.Price.toFixed(2)} EUR</p>
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
