import { z } from "zod"
import type { Tag } from "./types"

/**
 * @module experticket-schema
 * @description Zod validation schemas for the Experticket API raw responses.
 */

// ── Base Schemas ──────────────────────────────────────────────────

/**
 * Schema for the base response shared by all Experticket API responses.
 */
export const ExperticketBaseResponseSchema = z.object({
  Success: z.boolean(),
  Timestamp: z.string().optional(),
  ErrorMessage: z.string().nullable().optional(),
  ErrorCodes: z.array(z.string()).optional(),
  ErrorEntityBreakDown: z
    .array(
      z.object({
        Id: z.string(),
        Name: z.string(),
      })
    )
    .optional(),
})

// ── Catalog Schemas ───────────────────────────────────────────────

export const CatalogTicketSchema = z.record(z.unknown()).and(z.object({
  TicketId: z.string(),
  TicketName: z.string().optional(),
  IsQuotaTicket: z.boolean().optional(),
  TicketEnclosureId: z.string().optional(),
  TicketEnclosureName: z.string().optional(),
  TicketQuestionsProfileId: z.string().optional(),
}))

export const CatalogSessionSchema = z.record(z.unknown()).and(z.object({
  SessionId: z.string(),
  SessionTime: z.string().optional(),
  SessionContentName: z.string().optional(),
  HasLimitedCapacity: z.boolean().optional(),
}))

export const CatalogProductSchema = z.record(z.unknown()).and(z.object({
  ProductId: z.string(),
  ProductName: z.string().optional(),
  ProductDescription: z.string().optional(),
  Price: z.number().optional(),
  PriceMode: z.number().optional(),
  AccessDateCriteria: z.number().optional(),
  DaysWithLimitedCapacity: z.array(z.string()).optional(),
  SalesDocumentSettings: z.unknown().optional(),
  Tickets: z.array(CatalogTicketSchema).optional(),
  Sessions: z.array(CatalogSessionSchema).optional(),
  ProductPaxGroupingId: z.string().optional(),
}))

export const CatalogProductBaseSchema = z.record(z.unknown()).and(z.object({
  ProductBaseId: z.string(),
  ProductBaseName: z.string().optional(),
  ProductBaseDescription: z.string().optional(),
  DaysWithLimitedCapacity: z.array(z.string()).optional(),
  Products: z.array(CatalogProductSchema).optional(),
}))

export const CatalogProviderSchema = z.record(z.unknown()).and(z.object({
  ProviderId: z.string(),
  ProviderName: z.string().optional(),
  ProviderDescription: z.string().optional(),
  ProviderCommercialName: z.string().optional(),
  ProviderAccessConditions: z.string().optional(),
  ProviderType: z.number().optional(),
  Logo: z.string().optional(),
  Tags: z.array(z.string()).optional(),
  ProductBases: z.array(CatalogProductBaseSchema).optional(),
  CombinedProducts: z.array(z.unknown()).optional(),
}))

export const CatalogResponseSchema = ExperticketBaseResponseSchema.extend({
  Providers: z.array(CatalogProviderSchema).optional(),
  CatalogLastUpdatedDateTime: z.string().optional(),
})

// ── Languages Schemas ─────────────────────────────────────────────

export const LanguageSchema = z.object({
  Code: z.string(),
  EnglishName: z.string(),
  NativeName: z.string(),
})

export const LanguagesResponseSchema = ExperticketBaseResponseSchema.extend({
  Languages: z.array(LanguageSchema).optional(),
})

// ── Tags Schemas ──────────────────────────────────────────────────

export const TagSchema: z.ZodType<Tag> = z.lazy(() =>
  z.object({
    Id: z.string(),
    Key: z.number(),
    Name: z.string(),
    PathName: z.string(),
    Children: z.array(TagSchema),
  })
)

export const TagsResponseSchema = ExperticketBaseResponseSchema.extend({
  Tags: z.array(TagSchema).optional(),
})

// ── Capacity Schemas ──────────────────────────────────────────────

export const CapacityItemSchema = z.object({
  ProductBaseId: z.string().optional(),
  ProductId: z.string().optional(),
  SessionId: z.string().optional(),
  Date: z.string(),
  AvailableCapacity: z.number().optional(),
  Price: z.number().optional(),
  PriceMode: z.number().optional(),
})

export const AvailableCapacityResponseSchema = ExperticketBaseResponseSchema.extend({
  ProductBases: z.array(CapacityItemSchema).optional(),
  Products: z.array(CapacityItemSchema).optional(),
  Sessions: z.array(CapacityItemSchema).optional(),
})

// ── Pricing Schemas ───────────────────────────────────────────────

export const RealTimePriceItemSchema = z.object({
  ProductId: z.string(),
  Date: z.string().optional(),
  AccessDate: z.string().optional(),
  Price: z.number(),
  PriceMode: z.number().optional(),
  CombinedProductId: z.string().optional(),
  Success: z.boolean().optional(),
  ErrorMessage: z.string().optional(),
})

export const RealTimePricesResponseSchema = ExperticketBaseResponseSchema.extend({
  ProductsRealTimePrices: z.array(RealTimePriceItemSchema).optional(),
})

// ── Questions Schemas ─────────────────────────────────────────────

export const TicketQuestionValueSchema = z.object({
  Id: z.string().optional(),
  Value: z.string().optional(),
})

export const TicketQuestionSchema = z.object({
  Id: z.string(),
  Question: z.string(),
  ShortQuestion: z.string().optional(),
  Required: z.boolean().optional(),
  DataType: z.string().optional(),
  Values: z.array(TicketQuestionValueSchema).optional(),
})

export const TicketQuestionsProfileSchema = z.object({
  Id: z.string(),
  Questions: z.array(TicketQuestionSchema).optional(),
})

export const TicketQuestionsTicketSchema = z.object({
  TicketId: z.string(),
  TicketQuestionsProfileId: z.string().optional(),
})

export const TicketQuestionsProductSchema = z.object({
  ProductId: z.string(),
  Tickets: z.array(TicketQuestionsTicketSchema).optional(),
})

export const TicketQuestionsResponseSchema = ExperticketBaseResponseSchema.extend({
  Products: z.array(TicketQuestionsProductSchema).optional(),
  TicketQuestionsProfiles: z.array(TicketQuestionsProfileSchema).optional(),
})

// ── Reservation Schemas ───────────────────────────────────────────

export const ReservationProductResponseSchema = z.object({
  ProductId: z.string(),
  Quantity: z.number(),
  Price: z.number().optional(),
  PriceMode: z.number().optional(),
  Success: z.boolean(),
  ErrorMessage: z.string().optional(),
  Tickets: z
    .array(
      z.object({
        TicketId: z.string(),
        SessionId: z.string().optional(),
        AccessDateTime: z.string().optional(),
      })
    )
    .optional(),
  CancellationConditions: z.unknown().optional(),
})

export const ReservationResponseSchema = ExperticketBaseResponseSchema.extend({
  ReservationId: z.string().optional(),
  MinutesToExpiry: z.number().optional(),
  AccessDateTime: z.string().optional(),
  AccessEndDateTime: z.string().optional(),
  TotalPrice: z.number().optional(),
  Products: z.array(ReservationProductResponseSchema).optional(),
})

// ── Transaction Schemas ───────────────────────────────────────────

export const TransactionTicketSchema = z.object({
  TicketId: z.string(),
  TicketName: z.string().optional(),
  AccessCode: z.string().optional(),
  BillingCode: z.string().optional(),
  SessionId: z.string().optional(),
  AccessDateTime: z.string().optional(),
  AccessEndDateTime: z.string().optional(),
  InternalCode: z.string().optional(),
  TicketEnclosureId: z.string().optional(),
  TicketEnclosureName: z.string().optional(),
  SuggestedAccessDateMessage: z.string().optional(),
})

export const TransactionProductSchema = z.object({
  ProductId: z.string(),
  ProductName: z.string().optional(),
  AccessCode: z.string().optional(),
  ProviderId: z.string().optional(),
  ProviderName: z.string().optional(),
  ProviderType: z.number().optional(),
  Price: z.number().optional(),
  RetailPrice: z.number().optional(),
  PriceWithoutVat: z.number().optional(),
  PriceMode: z.number().optional(),
  Status: z.number().optional(),
  CombinedProductId: z.string().optional(),
  Tickets: z.array(TransactionTicketSchema).optional(),
  CancellationConditions: z.unknown().optional(),
})

export const TransactionSchema = z.record(z.unknown()).and(z.object({
  SaleId: z.string().optional(),
  TransactionId: z.string().optional(),
  AccessDateTime: z.string().optional(),
  TransactionDateTime: z.string().optional(),
  CancelledDateTime: z.string().nullable().optional(),
  TotalPrice: z.number().optional(),
  TotalRetailPrice: z.number().optional(),
  TotalPriceWithoutVat: z.number().optional(),
  PaymentStatus: z.number().optional(),
  Products: z.array(TransactionProductSchema).optional(),
  Client: z.record(z.unknown()).optional(),
  CombinedProducts: z.array(z.unknown()).optional(),
}))

export const TransactionListResponseSchema = ExperticketBaseResponseSchema.extend({
  Transactions: z.array(TransactionSchema).optional(),
  PageNumber: z.number().optional(),
  PageSize: z.number().optional(),
  TotalItemCount: z.number().optional(),
  PageCount: z.number().optional(),
  HasPreviousPage: z.boolean().optional(),
  HasNextPage: z.boolean().optional(),
  IsFirstPage: z.boolean().optional(),
  IsLastPage: z.boolean().optional(),
  FirstItemOnPage: z.number().optional(),
  LastItemOnPage: z.number().optional(),
})

// ── Documents Schemas ─────────────────────────────────────────────

export const TransactionDocumentSchema = z.object({
  SalesDocumentUrl: z.string(),
  LanguageCode: z.string().optional(),
})

export const TransactionDocumentsResponseSchema = ExperticketBaseResponseSchema.extend({
  Documents: z.array(TransactionDocumentSchema).optional(),
})

// ── Access Codes Schemas ──────────────────────────────────────────

export const AccessCodeTicketSchema = z.object({
  Id: z.string(),
  AccessCode: z.string().optional(),
  DeliveryState: z.number().optional(),
  InternalCode: z.string().optional(),
})

export const AccessCodeProductSchema = z.object({
  Id: z.string(),
  Tickets: z.array(AccessCodeTicketSchema).optional(),
})

export const AccessCodeTransactionSchema = z.object({
  Id: z.string(),
  Products: z.array(AccessCodeProductSchema).optional(),
})

export const AccessCodesResponseSchema = ExperticketBaseResponseSchema.extend({
  Transactions: z.array(AccessCodeTransactionSchema).optional(),
})

// ── Cancellation Schemas ──────────────────────────────────────────

export const CancellationRequestResponseSchema = ExperticketBaseResponseSchema.extend({
  CancellationRequestId: z.string().optional(),
})

export const CancellationRequestItemSchema = z.object({
  CancellationRequestId: z.string(),
  SaleId: z.string().optional(),
  PartnerSaleId: z.string().optional(),
  CreatedDateTime: z.string().optional(),
  UpdatedDateTime: z.string().optional(),
  Status: z.number().optional(),
  StatusComments: z.string().optional(),
})

export const CancellationListResponseSchema = ExperticketBaseResponseSchema.extend({
  CancellationRequests: z.array(CancellationRequestItemSchema).optional(),
  PageNumber: z.number().optional(),
  PageSize: z.number().optional(),
  HasPreviousPage: z.boolean().optional(),
  HasNextPage: z.boolean().optional(),
  IsFirstPage: z.boolean().optional(),
})

export const LastUpdatedResponseSchema = ExperticketBaseResponseSchema.extend({
  LastUpdatedDateTime: z.string().optional(),
})
