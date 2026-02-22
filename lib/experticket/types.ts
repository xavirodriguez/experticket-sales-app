/**
 * @module experticket-types
 * @description Type definitions for the Experticket API requests and responses.
 */

// ── Experticket API Types ──────────────────────────────────────────

/**
 * Base response shape shared by all Experticket API responses.
 */
export interface ExperticketBaseResponse {
  /** Indicates if the request was successful. */
  Success: boolean
  /** ISO timestamp of the response. */
  Timestamp?: string
  /** Human-readable error message if Success is false. */
  ErrorMessage?: string | null
  /** List of error codes. */
  ErrorCodes?: string[]
  /** Detailed breakdown of errors by entity. */
  ErrorEntityBreakDown?: { Id: string; Name: string }[]
}

// ── Catalog ───────────────────────────────────────────────────────

/**
 * Represents a ticket in the product catalog.
 */
export interface CatalogTicket {
  /** Unique identifier for the ticket. */
  TicketId: string
  /** Display name of the ticket. */
  TicketName?: string
  /** Whether this ticket belongs to a quota. */
  IsQuotaTicket?: boolean
  /** Identifier for the ticket enclosure. */
  TicketEnclosureId?: string
  /** Name of the ticket enclosure. */
  TicketEnclosureName?: string
  /** ID of the associated questions profile. */
  TicketQuestionsProfileId?: string
  [key: string]: unknown
}

/**
 * Represents a session (time slot) for a product.
 */
export interface CatalogSession {
  /** Unique identifier for the session. */
  SessionId: string
  /** Start time of the session. */
  SessionTime?: string
  /** Name/Description of the session content. */
  SessionContentName?: string
  /** Whether the session has a fixed capacity. */
  HasLimitedCapacity?: boolean
  [key: string]: unknown
}

/**
 * Represents a product available for sale.
 */
export interface CatalogProduct {
  /** Unique identifier for the product. */
  ProductId: string
  /** Name of the product. */
  ProductName?: string
  /** Detailed description of the product. */
  ProductDescription?: string
  /** Default price. */
  Price?: number
  /** Pricing mode (e.g., per person, per group). */
  PriceMode?: number
  /** Criteria for access date selection. */
  AccessDateCriteria?: number
  /** Dates that have capacity limits. */
  DaysWithLimitedCapacity?: string[]
  /** Document settings for sales. */
  SalesDocumentSettings?: unknown
  /** List of tickets associated with this product. */
  Tickets?: CatalogTicket[]
  /** List of available sessions. */
  Sessions?: CatalogSession[]
  /** ID for grouping by pax (passengers). */
  ProductPaxGroupingId?: string
  [key: string]: unknown
}

/**
 * A logical group of products.
 */
export interface CatalogProductBase {
  /** Unique identifier for the product base. */
  ProductBaseId: string
  /** Name of the product base. */
  ProductBaseName?: string
  /** Description of the product base. */
  ProductBaseDescription?: string
  /** Dates with capacity restrictions at the base level. */
  DaysWithLimitedCapacity?: string[]
  /** Products belonging to this base. */
  Products?: CatalogProduct[]
  [key: string]: unknown
}

/**
 * Represents a service provider (e.g., a museum or tour operator).
 */
export interface CatalogProvider {
  /** Unique identifier for the provider. */
  ProviderId: string
  /** Official name of the provider. */
  ProviderName?: string
  /** Detailed provider description. */
  ProviderDescription?: string
  /** Commercial/Trade name. */
  ProviderCommercialName?: string
  /** Terms and conditions for access. */
  ProviderAccessConditions?: string
  /** Type classification of the provider. */
  ProviderType?: number
  /** URL to the provider's logo. */
  Logo?: string
  /** Descriptive tags. */
  Tags?: string[]
  /** List of product bases offered by this provider. */
  ProductBases?: CatalogProductBase[]
  /** List of products that combine multiple services. */
  CombinedProducts?: unknown[]
  [key: string]: unknown
}

/**
 * Response returned by the catalog endpoint.
 */
export interface CatalogResponse extends ExperticketBaseResponse {
  /** List of providers found in the catalog. */
  Providers?: CatalogProvider[]
  /** Last time the catalog was updated in the source system. */
  CatalogLastUpdatedDateTime?: string
}

// ── Languages ─────────────────────────────────────────────────────

/**
 * Represents a supported language.
 */
export interface Language {
  /** ISO language code (e.g., "en", "es"). */
  Code: string
  /** Name of the language in English. */
  EnglishName: string
  /** Name of the language in its native tongue. */
  NativeName: string
}

/**
 * Response containing available languages.
 */
export interface LanguagesResponse extends ExperticketBaseResponse {
  /** List of supported languages. */
  Languages?: Language[]
}

// ── Tags ──────────────────────────────────────────────────────────

/**
 * Hierarchical tag for classifying products or providers.
 */
export interface Tag {
  /** Unique identifier. */
  Id: string
  /** Numeric key. */
  Key: number
  /** Display name. */
  Name: string
  /** Full path name for hierarchical tags. */
  PathName: string
  /** Child tags. */
  Children: Tag[]
}

/**
 * Response containing the tag hierarchy.
 */
export interface TagsResponse extends ExperticketBaseResponse {
  /** Root level tags. */
  Tags?: Tag[]
}

// ── Last Updated ──────────────────────────────────────────────────

/**
 * Response indicating the last update time of the Experticket system.
 */
export interface LastUpdatedResponse extends ExperticketBaseResponse {
  /** ISO timestamp of the last update. */
  LastUpdatedDateTime?: string
}

// ── Available Capacity ────────────────────────────────────────────

/**
 * Represents capacity information for a specific item on a specific date.
 */
export interface CapacityItem {
  /** Product Base ID if applicable. */
  ProductBaseId?: string
  /** Product ID if applicable. */
  ProductId?: string
  /** Session ID if applicable. */
  SessionId?: string
  /** The date for which capacity is being reported. */
  Date: string
  /** Number of remaining slots. Undefined if unlimited. */
  AvailableCapacity?: number
  /** Price applicable for this date/item. */
  Price?: number
  /** Pricing mode for this specific capacity item. */
  PriceMode?: number
}

/**
 * Response returned when checking for available capacity.
 */
export interface AvailableCapacityResponse extends ExperticketBaseResponse {
  /** Capacity information grouped by Product Base. */
  ProductBases?: CapacityItem[]
  /** Capacity information grouped by Product. */
  Products?: CapacityItem[]
  /** Capacity information grouped by Session. */
  Sessions?: CapacityItem[]
}

// ── Real-Time Prices ──────────────────────────────────────────────

/**
 * Represents a price for a product at a specific point in time.
 */
export interface RealTimePriceItem {
  /** Identifier of the product. */
  ProductId: string
  /** Date for the price. */
  Date?: string
  /** Access date if different from the selection date. */
  AccessDate?: string
  /** Calculated price. */
  Price: number
  /** Price mode. */
  PriceMode?: number
  /** ID if this price belongs to a combined product. */
  CombinedProductId?: string
  /** Success status for this specific price calculation. */
  Success?: boolean
  /** Error message if calculation failed for this item. */
  ErrorMessage?: string
}

/**
 * Response returned by the real-time pricing endpoint.
 */
export interface RealTimePricesResponse extends ExperticketBaseResponse {
  /** List of calculated prices. */
  ProductsRealTimePrices?: RealTimePriceItem[]
}

// ── Ticket Questions ──────────────────────────────────────────────

/**
 * Predefined value for a ticket question.
 */
export interface TicketQuestionValue {
  /** ID of the value option. */
  Id?: string
  /** Display string of the value option. */
  Value?: string
}

/**
 * A question that must be answered during the reservation process.
 */
export interface TicketQuestion {
  /** Unique identifier for the question. */
  Id: string
  /** Full text of the question. */
  Question: string
  /** Short version of the question text. */
  ShortQuestion?: string
  /** Whether an answer is mandatory. */
  Required?: boolean
  /** Expected data type (e.g., "string", "boolean", "int"). */
  DataType?: string
  /** List of valid values for multiple-choice questions. */
  Values?: TicketQuestionValue[]
}

/**
 * A profile grouping multiple questions.
 */
export interface TicketQuestionsProfile {
  /** Unique identifier. */
  Id: string
  /** List of questions in this profile. */
  Questions?: TicketQuestion[]
}

/**
 * Mapping between a ticket and its question profile.
 */
export interface TicketQuestionsTicket {
  /** Identifier of the ticket. */
  TicketId: string
  /** ID of the profile containing the questions. */
  TicketQuestionsProfileId?: string
}

/**
 * Mapping between a product and its tickets' questions.
 */
export interface TicketQuestionsProduct {
  /** Identifier of the product. */
  ProductId: string
  /** Tickets belonging to this product that may have questions. */
  Tickets?: TicketQuestionsTicket[]
}

/**
 * Response containing all questions required for the selected products.
 */
export interface TicketQuestionsResponse extends ExperticketBaseResponse {
  /** Products and their associated ticket questions. */
  Products?: TicketQuestionsProduct[]
  /** Detailed definitions of the question profiles. */
  TicketQuestionsProfiles?: TicketQuestionsProfile[]
}

// ── Reservation ───────────────────────────────────────────────────

/**
 * Data needed to reserve a specific product.
 */
export interface ReservationProductRequest {
  /** ID of the product to reserve. */
  ProductId: string
  /** Number of units. */
  Quantity: number
  /** Optional ID for a combined product. */
  CombinedProductId?: string | null
  /** Detailed ticket-level information, including answers to questions. */
  Tickets?: {
    /** ID of the ticket. */
    TicketId: string
    /** ID of the selected session. */
    SessionId?: string
    /** ISO date/time for access. */
    AccessDateTime?: string
    /** Answers to mandatory questions. */
    Questions?: {
      /** ID of the question being answered. */
      TicketQuestionId: string
      /** Value if the answer is a string. */
      StringValue?: string
      /** Value if the answer is a boolean. */
      BooleanValue?: boolean
      /** Value if the answer is a date/time. */
      DateTimeValue?: string
      /** Value if the answer is an integer. */
      IntegerValue?: number
      /** Value if the answer is a decimal. */
      DecimalValue?: number
    }[]
  }[] | null
  /** Default access start time for this product. */
  AccessDateTime?: string | null
  /** Default access end time for this product. */
  AccessEndDateTime?: string | null
}

/**
 * Request payload to create a new reservation.
 */
export interface ReservationRequest {
  /** API Key for authentication. */
  ApiKey?: string
  /** Whether to process as a test transaction. */
  IsTest?: boolean
  /** General access date/time. */
  AccessDateTime: string
  /** General access end date/time. */
  AccessEndDateTime?: string
  /** List of products to include in the reservation. */
  Products: ReservationProductRequest[]
  /** Preferred language for the response. */
  LanguageCode?: string | null
}

/**
 * Response for an individual product in a reservation.
 */
export interface ReservationProductResponse {
  /** Product ID. */
  ProductId: string
  /** Reserved quantity. */
  Quantity: number
  /** Unit price at the time of reservation. */
  Price?: number
  /** Price mode. */
  PriceMode?: number
  /** Whether the reservation for this product succeeded. */
  Success: boolean
  /** Error message if product reservation failed. */
  ErrorMessage?: string
  /** List of tickets generated by the reservation. */
  Tickets?: { TicketId: string; SessionId?: string; AccessDateTime?: string }[]
  /** Conditions for cancelling this product. */
  CancellationConditions?: unknown
}

/**
 * Response returned after attempting to create a reservation.
 */
export interface ReservationResponse extends ExperticketBaseResponse {
  /** Unique ID for the created reservation. Used to finalize the transaction. */
  ReservationId?: string
  /** Time remaining until the reservation expires. */
  MinutesToExpiry?: number
  /** Confirmed access start time. */
  AccessDateTime?: string
  /** Confirmed access end time. */
  AccessEndDateTime?: string
  /** Total price for all products in the reservation. */
  TotalPrice?: number
  /** Detailed results for each product. */
  Products?: ReservationProductResponse[]
}

// ── Transaction ───────────────────────────────────────────────────

/**
 * Request payload to convert a reservation into a final transaction.
 */
export interface TransactionCreateRequest {
  /** API Key. */
  ApiKey?: string
  /** Whether this is a test transaction. */
  IsTest?: boolean
  /** ID of the pre-existing reservation. */
  ReservationId: string
  /** Confirmed access date/time. */
  AccessDateTime: string
  /** List of product IDs confirming the sale. */
  Products: { ProductId: string }[]
}

/**
 * Represents a ticket within a completed transaction.
 */
export interface TransactionTicket {
  /** Unique identifier for the ticket instance. */
  TicketId: string
  /** Name of the ticket. */
  TicketName?: string
  /** Code used for entry/access. */
  AccessCode?: string
  /** Code for billing purposes. */
  BillingCode?: string
  /** ID of the session the ticket is valid for. */
  SessionId?: string
  /** Confirmed access start time. */
  AccessDateTime?: string
  /** Confirmed access end time. */
  AccessEndDateTime?: string
  /** Internal system code. */
  InternalCode?: string
  /** ID of the enclosure. */
  TicketEnclosureId?: string
  /** Name of the enclosure. */
  TicketEnclosureName?: string
  /** Message about the suggested access time. */
  SuggestedAccessDateMessage?: string
}

/**
 * Represents a product within a completed transaction.
 */
export interface TransactionProduct {
  /** Product ID. */
  ProductId: string
  /** Product Name. */
  ProductName?: string
  /** Main access code for the product. */
  AccessCode?: string
  /** Provider ID. */
  ProviderId?: string
  /** Provider Name. */
  ProviderName?: string
  /** Provider type code. */
  ProviderType?: number
  /** Sale price. */
  Price?: number
  /** MSRP / Retail price. */
  RetailPrice?: number
  /** Price before taxes. */
  PriceWithoutVat?: number
  /** Price mode. */
  PriceMode?: number
  /** Current status (e.g., active, cancelled). */
  Status?: number
  /** ID if part of a combined product. */
  CombinedProductId?: string
  /** Individual tickets generated for this product. */
  Tickets?: TransactionTicket[]
  /** Rules for cancellation. */
  CancellationConditions?: unknown
}

/**
 * Represents a completed sale or transaction.
 */
export interface Transaction {
  /** ID of the sale. */
  SaleId?: string
  /** ID of the transaction. */
  TransactionId?: string
  /** Access date/time. */
  AccessDateTime?: string
  /** Date/time when the transaction was created. */
  TransactionDateTime?: string
  /** Date/time when the transaction was cancelled, if applicable. */
  CancelledDateTime?: string | null
  /** Total price charged. */
  TotalPrice?: number
  /** Total MSRP. */
  TotalRetailPrice?: number
  /** Total price before taxes. */
  TotalPriceWithoutVat?: number
  /** Status of the payment. */
  PaymentStatus?: number
  /** Products included in this transaction. */
  Products?: TransactionProduct[]
  /** Client information. */
  Client?: Record<string, unknown>
  /** Combined products info. */
  CombinedProducts?: unknown[]
  [key: string]: unknown
}

/**
 * Paginated response containing a list of transactions.
 */
export interface TransactionListResponse extends ExperticketBaseResponse {
  /** The list of transaction records for the current page. */
  Transactions?: Transaction[]
  /** Current page index. */
  PageNumber?: number
  /** Number of items per page. */
  PageSize?: number
  /** Total number of items across all pages. */
  TotalItemCount?: number
  /** Total number of pages. */
  PageCount?: number
  /** Whether a previous page exists. */
  HasPreviousPage?: boolean
  /** Whether a next page exists. */
  HasNextPage?: boolean
  /** Whether this is the first page. */
  IsFirstPage?: boolean
  /** Whether this is the last page. */
  IsLastPage?: boolean
  /** Index of the first item on this page. */
  FirstItemOnPage?: number
  /** Index of the last item on this page. */
  LastItemOnPage?: number
}

// ── Transaction Documents ─────────────────────────────────────────

/**
 * Represents a downloadable document (e.g., PDF ticket) for a transaction.
 */
export interface TransactionDocument {
  /** Direct URL to download the document. */
  SalesDocumentUrl: string
  /** Language of the document. */
  LanguageCode?: string
}

/**
 * Response containing links to transaction documents.
 */
export interface TransactionDocumentsResponse extends ExperticketBaseResponse {
  /** List of generated documents. */
  Documents?: TransactionDocument[]
}

// ── Access Codes ──────────────────────────────────────────────────

/**
 * Details of an individual ticket's access code.
 */
export interface AccessCodeTicket {
  /** Ticket instance ID. */
  Id: string
  /** The access code string. */
  AccessCode?: string
  /** Delivery status of the code. */
  DeliveryState?: number
  /** Internal code for tracking. */
  InternalCode?: string
}

/**
 * Product-level access code info.
 */
export interface AccessCodeProduct {
  /** Product instance ID. */
  Id: string
  /** Codes for individual tickets. */
  Tickets?: AccessCodeTicket[]
}

/**
 * Transaction-level access code info.
 */
export interface AccessCodeTransaction {
  /** Transaction ID. */
  Id: string
  /** Codes grouped by product. */
  Products?: AccessCodeProduct[]
}

/**
 * Response returned when querying for access codes.
 */
export interface AccessCodesResponse extends ExperticketBaseResponse {
  /** List of transactions and their associated access codes. */
  Transactions?: AccessCodeTransaction[]
}

// ── Cancellation ──────────────────────────────────────────────────

/**
 * Request payload to initiate a cancellation.
 */
export interface CancellationRequest {
  /** API Key. */
  ApiKey?: string
  /** Test mode flag. */
  IsTest?: boolean
  /** ID of the sale to cancel. */
  SaleId: string
  /** Numeric reason code. */
  Reason: number
  /** Human-readable explanation. */
  ReasonComments?: string
}

/**
 * Response confirming the creation of a cancellation request.
 */
export interface CancellationRequestResponse extends ExperticketBaseResponse {
  /** Unique ID for the cancellation request. */
  CancellationRequestId?: string
}

/**
 * Represents an item in a list of cancellation requests.
 */
export interface CancellationRequestItem {
  /** Unique ID for the request. */
  CancellationRequestId: string
  /** ID of the associated sale. */
  SaleId?: string
  /** Partner's ID for the sale. */
  PartnerSaleId?: string
  /** When the request was created. */
  CreatedDateTime?: string
  /** When the request was last updated. */
  UpdatedDateTime?: string
  /** Current status of the request (e.g., pending, approved, rejected). */
  Status?: number
  /** Status-related comments. */
  StatusComments?: string
}

/**
 * Paginated response containing a list of cancellation requests.
 */
export interface CancellationListResponse extends ExperticketBaseResponse {
  /** List of cancellation request items for the current page. */
  CancellationRequests?: CancellationRequestItem[]
  /** Page number. */
  PageNumber?: number
  /** Page size. */
  PageSize?: number
  /** Whether a previous page exists. */
  HasPreviousPage?: boolean
  /** Whether a next page exists. */
  HasNextPage?: boolean
  /** Whether this is the first page. */
  IsFirstPage?: boolean
}
