import { z } from "zod"
import type { Tag } from "./types"

/**
 * @module experticket-schema
 * @description Zod validation schemas for the Experticket API raw responses.
 */

// ── Base Schemas ──────────────────────────────────────────────────

/**
 * Validates the base response shape shared by all Experticket API responses.
 *
 * @remarks
 * Every response from the Experticket API includes a `Success` flag and optional
 * error details used to diagnose failures.
 */
export const ExperticketBaseResponseSchema = z.object({
  /** Indicates if the request was successful. */
  Success: z.boolean(),
  /** ISO 8601 timestamp of when the response was generated. */
  Timestamp: z.string().optional(),
  /** Human-readable error message. */
  ErrorMessage: z.string().nullable().optional(),
  /** List of machine-readable error codes. */
  ErrorCodes: z.array(z.string()).optional(),
  /** Detailed breakdown of errors mapped to specific entities. */
  ErrorEntityBreakDown: z
    .array(
      z.object({
        /** Identifier of the entity related to the error. */
        Id: z.string(),
        /** Name of the entity related to the error. */
        Name: z.string(),
      })
    )
    .optional(),
})

// ── Catalog Schemas ───────────────────────────────────────────────

/** Validates an individual ticket item within the product catalog. */
export const CatalogTicketSchema = z.record(z.unknown()).and(z.object({
  /** Unique ticket identifier. */
  TicketId: z.string(),
  /** Display name of the ticket. */
  TicketName: z.string().optional(),
  /** Indicates if the ticket is subject to quota. */
  IsQuotaTicket: z.boolean().optional(),
  /** Identifier of the venue enclosure. */
  TicketEnclosureId: z.string().optional(),
  /** Name of the venue enclosure. */
  TicketEnclosureName: z.string().optional(),
  /** Identifier of the associated question profile. */
  TicketQuestionsProfileId: z.string().optional(),
}))

/** Validates a specific time slot or session available for a product. */
export const CatalogSessionSchema = z.record(z.unknown()).and(z.object({
  /** Unique session identifier. */
  SessionId: z.string(),
  /** ISO 8601 string representing the start time. */
  SessionTime: z.string().optional(),
  /** Descriptive name for the session content. */
  SessionContentName: z.string().optional(),
  /** Indicates if the session has a fixed capacity. */
  HasLimitedCapacity: z.boolean().optional(),
}))

/** Validates a product available for purchase. */
export const CatalogProductSchema = z.record(z.unknown()).and(z.object({
  /** Unique product identifier. */
  ProductId: z.string(),
  /** Display name of the product. */
  ProductName: z.string().optional(),
  /** Multi-line description of the product. */
  ProductDescription: z.string().optional(),
  /** Base price for the product. */
  Price: z.number().optional(),
  /** Numeric identifier for the pricing mode. */
  PriceMode: z.number().optional(),
  /** Criteria code for access date validation. */
  AccessDateCriteria: z.number().optional(),
  /** ISO 8601 dates with specific capacity constraints. */
  DaysWithLimitedCapacity: z.array(z.string()).optional(),
  /** Settings for generating sales documents. */
  SalesDocumentSettings: z.unknown().optional(),
  /** Tickets available under this product. */
  Tickets: z.array(CatalogTicketSchema).optional(),
  /** Time slots available for this product. */
  Sessions: z.array(CatalogSessionSchema).optional(),
  /** Identifier for grouping products by pax types. */
  ProductPaxGroupingId: z.string().optional(),
  /** Indicates if the product requires real-time price. */
  RequiresRealTimePrice: z.boolean().optional(),
}))

/** Validates a logical grouping of related products. */
export const CatalogProductBaseSchema = z.record(z.unknown()).and(z.object({
  /** Unique product base identifier. */
  ProductBaseId: z.string(),
  /** Name of the product base. */
  ProductBaseName: z.string().optional(),
  /** Description of the product base. */
  ProductBaseDescription: z.string().optional(),
  /** Dates with restricted capacity at the base level. */
  DaysWithLimitedCapacity: z.array(z.string()).optional(),
  /** Individual products belonging to this base. */
  Products: z.array(CatalogProductSchema).optional(),
}))

/** Validates a service provider such as a venue or operator. */
export const CatalogProviderSchema = z.record(z.unknown()).and(z.object({
  /** Unique provider identifier. */
  ProviderId: z.string(),
  /** Official name of the provider. */
  ProviderName: z.string().optional(),
  /** Comprehensive provider description. */
  ProviderDescription: z.string().optional(),
  /** Trade or commercial name. */
  ProviderCommercialName: z.string().optional(),
  /** Terms and conditions for venue access. */
  ProviderAccessConditions: z.string().optional(),
  /** Numeric code for provider classification. */
  ProviderType: z.number().optional(),
  /** URL to the provider's logo image. */
  Logo: z.string().optional(),
  /** Classification tags associated with the provider. */
  Tags: z.array(z.string()).optional(),
  /** Product bases offered by this provider. */
  ProductBases: z.array(CatalogProductBaseSchema).optional(),
  /** Products integrating services from multiple entities. */
  CombinedProducts: z.array(z.unknown()).optional(),
}))

/** Validates the response from the product catalog endpoint. */
export const CatalogResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Collection of providers and their products. */
  Providers: z.array(CatalogProviderSchema).optional(),
  /** ISO 8601 timestamp of the last catalog sync. */
  CatalogLastUpdatedDateTime: z.string().optional(),
})

// ── Languages Schemas ─────────────────────────────────────────────

/** Validates a language supported by the platform. */
export const LanguageSchema = z.object({
  /** ISO 639-1 language code. */
  Code: z.string(),
  /** Name of the language in English. */
  EnglishName: z.string(),
  /** Name of the language in its native script. */
  NativeName: z.string(),
})

/** Validates the response containing all available system languages. */
export const LanguagesResponseSchema = ExperticketBaseResponseSchema.extend({
  /** List of supported languages for localization. */
  Languages: z.array(LanguageSchema).optional(),
})

// ── Tags Schemas ──────────────────────────────────────────────────

/** Validates a hierarchical tag used for classification. */
export const TagSchema: z.ZodType<Tag> = z.lazy(() =>
  z.object({
    /** Unique tag identifier. */
    Id: z.string(),
    /** Legacy numeric system key. */
    Key: z.number(),
    /** Localized tag name. */
    Name: z.string(),
    /** Fully qualified hierarchical path name. */
    PathName: z.string(),
    /** Nested child tags. */
    Children: z.array(TagSchema),
  })
)

/** Validates the response containing the complete tag hierarchy. */
export const TagsResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Root-level tags in the hierarchy. */
  Tags: z.array(TagSchema).optional(),
})

// ── Capacity Schemas ──────────────────────────────────────────────

/** Validates remaining capacity for a specific item on a specific date. */
export const CapacityItemSchema = z.object({
  /** Identifier of the product base. */
  ProductBaseId: z.string().optional(),
  /** Identifier of the specific product. */
  ProductId: z.string().optional(),
  /** Identifier of the session. */
  SessionId: z.string().optional(),
  /** ISO 8601 date string. */
  Date: z.string(),
  /** Number of remaining available slots. */
  AvailableCapacity: z.number().optional(),
  /** Current price applicable. */
  Price: z.number().optional(),
  /** Pricing mode applicable. */
  PriceMode: z.number().optional(),
})

/** Validates the response returned when querying for available capacity. */
export const AvailableCapacityResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Capacity records grouped by product base. */
  ProductBases: z.array(CapacityItemSchema).optional(),
  /** Capacity records grouped by individual product. */
  Products: z.array(CapacityItemSchema).optional(),
  /** Capacity records grouped by session. */
  Sessions: z.array(CapacityItemSchema).optional(),
})

// ── Pricing Schemas ───────────────────────────────────────────────

/** Validates dynamic price calculation for a product. */
export const RealTimePriceItemSchema = z.object({
  /** Identifier of the product. */
  ProductId: z.string(),
  /** ISO 8601 date used for calculation. */
  Date: z.string().optional(),
  /** Actual date of access. */
  AccessDate: z.string().optional(),
  /** Final calculated numeric price. */
  Price: z.number(),
  /** Numeric identifier for the price mode. */
  PriceMode: z.number().optional(),
  /** Identifier of the parent combined product. */
  CombinedProductId: z.string().optional(),
  /** Indicates if calculation succeeded for this item. */
  Success: z.boolean().optional(),
  /** Error message if calculation failed. */
  ErrorMessage: z.string().optional(),
})

/** Validates the response from the real-time pricing endpoint. */
export const RealTimePricesResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Collection of calculated real-time prices. */
  ProductsRealTimePrices: z.array(RealTimePriceItemSchema).optional(),
})

// ── Questions Schemas ─────────────────────────────────────────────

/** Validates a predefined selectable value for a multi-choice question. */
export const TicketQuestionValueSchema = z.object({
  /** Unique identifier for the value option. */
  Id: z.string().optional(),
  /** Localized display string. */
  Value: z.string().optional(),
})

/** Validates a mandatory or optional ticket question. */
export const TicketQuestionSchema = z.object({
  /** Unique identifier for the question. */
  Id: z.string(),
  /** Full text of the question. */
  Question: z.string(),
  /** Condensed version of the question text. */
  ShortQuestion: z.string().optional(),
  /** Indicates if an answer must be provided. */
  Required: z.boolean().optional(),
  /** Expected primitive data type of the answer. */
  DataType: z.string().optional(),
  /** List of valid options for multi-choice questions. */
  Values: z.array(TicketQuestionValueSchema).optional(),
})

/** Validates a collection of questions grouped under a profile. */
export const TicketQuestionsProfileSchema = z.object({
  /** Unique identifier for the question profile. */
  Id: z.string(),
  /** Ordered list of questions. */
  Questions: z.array(TicketQuestionSchema).optional(),
})

/** Validates the link between a ticket and its required question profile. */
export const TicketQuestionsTicketSchema = z.object({
  /** Unique identifier of the ticket. */
  TicketId: z.string(),
  /** Identifier of the profile containing the questions. */
  TicketQuestionsProfileId: z.string().optional(),
})

/** Validates the link between a product and required ticket questions. */
export const TicketQuestionsProductSchema = z.object({
  /** Unique identifier of the product. */
  ProductId: z.string(),
  /** List of tickets requiring answers to questions. */
  Tickets: z.array(TicketQuestionsTicketSchema).optional(),
})

/** Validates the response containing all required questions for a selection. */
export const TicketQuestionsResponseSchema = ExperticketBaseResponseSchema.extend({
  /** List of products and their ticket-level requirements. */
  Products: z.array(TicketQuestionsProductSchema).optional(),
  /** Complete definitions for all question profiles. */
  TicketQuestionsProfiles: z.array(TicketQuestionsProfileSchema).optional(),
})

// ── Reservation Schemas ───────────────────────────────────────────

/** Validates reservation status for an individual product. */
export const ReservationProductResponseSchema = z.object({
  /** Identifier of the product. */
  ProductId: z.string(),
  /** Reserved quantity. */
  Quantity: z.number(),
  /** Unit price applied. */
  Price: z.number().optional(),
  /** Numeric pricing mode. */
  PriceMode: z.number().optional(),
  /** Indicates if reservation for this specific product succeeded. */
  Success: z.boolean(),
  /** Error message if reservation failed. */
  ErrorMessage: z.string().optional(),
  /** Individual ticket instances generated. */
  Tickets: z
    .array(
      z.object({
        /** Identifier of the ticket. */
        TicketId: z.string(),
        /** Identifier of the session. */
        SessionId: z.string().optional(),
        /** ISO 8601 access time. */
        AccessDateTime: z.string().optional(),
      })
    )
    .optional(),
  /** Rules for cancelling this product reservation. */
  CancellationConditions: z.unknown().optional(),
})

/** Validates the response returned after a reservation attempt. */
export const ReservationResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Unique identifier for the created reservation. */
  ReservationId: z.string().optional(),
  /** Minutes remaining before expiration. */
  MinutesToExpiry: z.number().optional(),
  /** Confirmed ISO 8601 access start time. */
  AccessDateTime: z.string().optional(),
  /** Confirmed ISO 8601 access end time. */
  AccessEndDateTime: z.string().optional(),
  /** Aggregate total price. */
  TotalPrice: z.number().optional(),
  /** Individual result details for each product. */
  Products: z.array(ReservationProductResponseSchema).optional(),
})

// ── Transaction Schemas ───────────────────────────────────────────

/** Validates a specific ticket instance within a finalized transaction. */
export const TransactionTicketSchema = z.object({
  /** Unique internal identifier for the ticket instance. */
  TicketId: z.string(),
  /** Name of the ticket type. */
  TicketName: z.string().optional(),
  /** Unique code used for venue entry. */
  AccessCode: z.string().optional(),
  /** Code used for financial reporting. */
  BillingCode: z.string().optional(),
  /** Identifier of the session. */
  SessionId: z.string().optional(),
  /** Confirmed ISO 8601 start time. */
  AccessDateTime: z.string().optional(),
  /** Confirmed ISO 8601 end time. */
  AccessEndDateTime: z.string().optional(),
  /** Internal tracking code. */
  InternalCode: z.string().optional(),
  /** Identifier of the venue enclosure. */
  TicketEnclosureId: z.string().optional(),
  /** Name of the venue enclosure. */
  TicketEnclosureName: z.string().optional(),
  /** Recommendation message regarding arrival. */
  SuggestedAccessDateMessage: z.string().optional(),
})

/** Validates a product record within a finalized transaction. */
export const TransactionProductSchema = z.object({
  /** Unique identifier of the product. */
  ProductId: z.string(),
  /** Human-readable name of the product. */
  ProductName: z.string().optional(),
  /** Primary access code. */
  AccessCode: z.string().optional(),
  /** Identifier of the provider. */
  ProviderId: z.string().optional(),
  /** Name of the provider. */
  ProviderName: z.string().optional(),
  /** Numeric classification code for the provider. */
  ProviderType: z.number().optional(),
  /** Final numeric price charged. */
  Price: z.number().optional(),
  /** Original manufacturer's suggested retail price. */
  RetailPrice: z.number().optional(),
  /** Price amount before VAT. */
  PriceWithoutVat: z.number().optional(),
  /** Numeric identifier for the pricing mode. */
  PriceMode: z.number().optional(),
  /** Current lifecycle status code. */
  Status: z.number().optional(),
  /** Identifier of the parent combined product. */
  CombinedProductId: z.string().optional(),
  /** Collection of individual tickets generated. */
  Tickets: z.array(TransactionTicketSchema).optional(),
  /** Finalized rules governing cancellation. */
  CancellationConditions: z.unknown().optional(),
})

/** Validates a completed sale or transaction record. */
export const TransactionSchema = z.record(z.unknown()).and(z.object({
  /** Unique identifier for the sale record. */
  SaleId: z.string().optional(),
  /** Alternative identifier for the transaction. */
  TransactionId: z.string().optional(),
  /** Confirmed ISO 8601 access time. */
  AccessDateTime: z.string().optional(),
  /** ISO 8601 creation timestamp. */
  TransactionDateTime: z.string().optional(),
  /** ISO 8601 cancellation timestamp. */
  CancelledDateTime: z.string().nullable().optional(),
  /** Aggregate total price charged. */
  TotalPrice: z.number().optional(),
  /** Aggregate total retail price. */
  TotalRetailPrice: z.number().optional(),
  /** Aggregate total price before VAT. */
  TotalPriceWithoutVat: z.number().optional(),
  /** Numeric status code for payment state. */
  PaymentStatus: z.number().optional(),
  /** Collection of products included in the sale. */
  Products: z.array(TransactionProductSchema).optional(),
  /** Metadata regarding the client. */
  Client: z.record(z.unknown()).optional(),
  /** Information regarding combined products. */
  CombinedProducts: z.array(z.unknown()).optional(),
}))

/** Validates a paginated response containing transaction records. */
export const TransactionListResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Collection of transaction records. */
  Transactions: z.array(TransactionSchema).optional(),
  /** Index of the current page. */
  PageNumber: z.number().optional(),
  /** Maximum number of items per page. */
  PageSize: z.number().optional(),
  /** Total matching items across all pages. */
  TotalItemCount: z.number().optional(),
  /** Total number of available pages. */
  PageCount: z.number().optional(),
  /** Indicates if a previous page exists. */
  HasPreviousPage: z.boolean().optional(),
  /** Indicates if a next page exists. */
  HasNextPage: z.boolean().optional(),
  /** Indicates if this is the first page. */
  IsFirstPage: z.boolean().optional(),
  /** Indicates if this is the last page. */
  IsLastPage: z.boolean().optional(),
  /** Index of the first item on the page. */
  FirstItemOnPage: z.number().optional(),
  /** Index of the last item on the page. */
  LastItemOnPage: z.number().optional(),
})

// ── Documents Schemas ─────────────────────────────────────────────

/** Validates a downloadable document associated with a transaction. */
export const TransactionDocumentSchema = z.object({
  /** Direct URL to download the document. */
  SalesDocumentUrl: z.string(),
  /** ISO language code of the document. */
  LanguageCode: z.string().optional(),
})

/** Validates the response containing transaction documents. */
export const TransactionDocumentsResponseSchema = ExperticketBaseResponseSchema.extend({
  /** List of generated documents. */
  Documents: z.array(TransactionDocumentSchema).optional(),
})

// ── Access Codes Schemas ──────────────────────────────────────────

/** Validates access code details for a ticket instance. */
export const AccessCodeTicketSchema = z.object({
  /** Unique identifier of the ticket instance. */
  Id: z.string(),
  /** String representation of the access code. */
  AccessCode: z.string().optional(),
  /** Numeric delivery state code. */
  DeliveryState: z.number().optional(),
  /** Internal tracking identifier. */
  InternalCode: z.string().optional(),
})

/** Validates access code information grouped by product. */
export const AccessCodeProductSchema = z.object({
  /** Unique identifier of the product instance. */
  Id: z.string(),
  /** Collection of access codes for tickets. */
  Tickets: z.array(AccessCodeTicketSchema).optional(),
})

/** Validates access code information for a transaction. */
export const AccessCodeTransactionSchema = z.object({
  /** Unique identifier of the transaction. */
  Id: z.string(),
  /** Collection of products and their access codes. */
  Products: z.array(AccessCodeProductSchema).optional(),
})

/** Validates the response returned for access code queries. */
export const AccessCodesResponseSchema = ExperticketBaseResponseSchema.extend({
  /** List of transactions and their access code hierarchies. */
  Transactions: z.array(AccessCodeTransactionSchema).optional(),
})

// ── Cancellation Schemas ──────────────────────────────────────────

/** Validates the response after creating a cancellation request. */
export const CancellationRequestResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Unique identifier for the cancellation request. */
  CancellationRequestId: z.string().optional(),
})

/** Validates a record of a previously submitted cancellation request. */
export const CancellationRequestItemSchema = z.object({
  /** Unique identifier of the cancellation request. */
  CancellationRequestId: z.string(),
  /** Identifier of the associated sale. */
  SaleId: z.string().optional(),
  /** Identifier assigned by the partner to the sale. */
  PartnerSaleId: z.string().optional(),
  /** ISO 8601 creation timestamp. */
  CreatedDateTime: z.string().optional(),
  /** ISO 8601 last update timestamp. */
  UpdatedDateTime: z.string().optional(),
  /** Numeric status code of the request. */
  Status: z.number().optional(),
  /** Comments regarding the request status. */
  StatusComments: z.string().optional(),
})

/** Validates a paginated response of cancellation requests. */
export const CancellationListResponseSchema = ExperticketBaseResponseSchema.extend({
  /** Collection of cancellation request items. */
  CancellationRequests: z.array(CancellationRequestItemSchema).optional(),
  /** Index of the current page. */
  PageNumber: z.number().optional(),
  /** Maximum items per page. */
  PageSize: z.number().optional(),
  /** Indicates if a previous page exists. */
  HasPreviousPage: z.boolean().optional(),
  /** Indicates if a next page exists. */
  HasNextPage: z.boolean().optional(),
  /** Indicates if this is the first page. */
  IsFirstPage: z.boolean().optional(),
})

/** Validates the response containing the system update time. */
export const LastUpdatedResponseSchema = ExperticketBaseResponseSchema.extend({
  /** ISO 8601 timestamp of the last system update. */
  LastUpdatedDateTime: z.string().optional(),
})
