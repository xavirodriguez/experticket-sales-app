import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import type { DomainProvider } from "@/lib/experticket/adapter"

/**
 * Props for the ProviderSelector component.
 */
interface Props {
  providers: DomainProvider[]
  isLoading: boolean
  selectedProvider: DomainProvider | undefined
  onSelect: (p: DomainProvider) => void
}

/**
 * Component for selecting a provider from the catalog.
 */
export function ProviderSelector({
  providers,
  isLoading,
  selectedProvider,
  onSelect,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Provider</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ProviderSkeleton />
        ) : providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No providers found. Check your API configuration.
          </p>
        ) : (
          <ScrollArea className="max-h-60">
            <div className="space-y-1">
              {providers.map((prov) => (
                <ProviderItem
                  key={prov.providerId}
                  provider={prov}
                  isSelected={selectedProvider?.providerId === prov.providerId}
                  onSelect={() => onSelect(prov)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function ProviderItem({
  provider,
  isSelected,
  onSelect,
}: {
  provider: DomainProvider
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
      }`}
    >
      <div>
        <span className="font-medium">
          {provider.providerName || provider.providerCommercialName || provider.providerId}
        </span>
        {provider.tags && provider.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {provider.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
    </button>
  )
}

function ProviderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
