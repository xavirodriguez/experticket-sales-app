/**
 * Type definitions for Experticket API requests and responses.
 *
 * @packageDocumentation
 */

// ── Experticket API Types ──────────────────────────────────────────

/**
 * Base response shape shared by all Experticket API responses.
 *
 * @remarks
 * All responses from the Experticket API include a `Success` flag indicating the
 * overall outcome of the request.
 */
export interface ExperticketBaseResponse {
  /** Indicates if the request was successful. */
  Success: boolean
  /** ISO 8601 timestamp indicating when the response was generated. */
  Timestamp?: string
  /**
   * Human-readable error message explaining the failure.
   *
   * @remarks
   * This field is typically populated only when {@link ExperticketBaseResponse.Success} is `false`.
   */
  ErrorMessage?: string | null
  /** List of machine-readable error codes associated with the failure. */
  ErrorCodes?: string[]
  /** Detailed breakdown of errors mapped to specific entity identifiers and names. */
  ErrorEntityBreakDown?: { Id: string; Name: string }[]
}

// ── Catalog ───────────────────────────────────────────────────────

/**
 * Individual ticket item within the product catalog.
 */
export interface CatalogTicket {
  /** Unique identifier for the ticket. */
  TicketId: string
  /** Display name of the ticket intended for end users. */
  TicketName?: string
  /** Indicates whether this ticket is subject to quota restrictions. */
  IsQuotaTicket?: boolean
  /** Identifier for the physical or logical enclosure associated with the ticket. */
  TicketEnclosureId?: string
  /** Human-readable name of the associated ticket enclosure. */
  TicketEnclosureName?: string
  /** Identifier of the questions profile containing mandatory fields for this ticket. */
  TicketQuestionsProfileId?: string
  /** Additional dynamic properties returned by the API. */
  [key: string]: unknown
}

/**
 * Specific time slot or session available for a product.
 */
export interface CatalogSession {
  /** Unique identifier for the session. */
  SessionId: string
  /** ISO 8601 string representing the start time of the session. */
  SessionTime?: string
  /** Descriptive name or content summary for the session. */
  SessionContentName?: string
  /** Indicates if the session has a fixed maximum capacity. */
  HasLimitedCapacity?: boolean
  /** Additional dynamic properties returned by the API. */
  [key: string]: unknown
}

/**
 * Product available for purchase in the Experticket system.
 *
 * @remarks
 * Products are the primary sellable units and contain associated tickets and sessions.
 */
export interface CatalogProduct {
  /** Unique identifier for the product. */
  ProductId: string
  /** Display name of the product. */
  ProductName?: string
  /** Detailed multi-line description of the product. */
  ProductDescription?: string
  /** Base price for the product. */
  Price?: number
  /** Numeric identifier representing the pricing mode (e.g., per person). */
  PriceMode?: number
  /** Criteria used to determine valid access dates. */
  AccessDateCriteria?: number
  /** List of ISO 8601 date strings that have specific capacity constraints. */
  DaysWithLimitedCapacity?: string[]
  /** Configuration settings for generating sales documents for this product. */
  SalesDocumentSettings?: unknown
  /** Collection of tickets available under this product. */
  Tickets?: CatalogTicket[]
  /** Collection of time slots available for this product. */
  Sessions?: CatalogSession[]
  /** Identifier used for grouping products by passenger (pax) types. */
  ProductPaxGroupingId?: string
  /** Additional dynamic properties returned by the API. */
  [key: string]: unknown
}

/**
 * Logical grouping of related products.
 *
 * @remarks
 * A product base can enforce capacity restrictions across all its child products.
 */
export interface CatalogProductBase {
  /** Unique identifier for the product base. */
  ProductBaseId: string
  /** Name of the product base. */
  ProductBaseName?: string
  /** Detailed description of the product base grouping. */
  ProductBaseDescription?: string
  /** Dates where capacity is restricted at the product base level. */
  DaysWithLimitedCapacity?: string[]
  /** List of individual products belonging to this base. */
  Products?: CatalogProduct[]
  /** Additional dynamic properties returned by the API. */
  [key: string]: unknown
}

/**
 * Service provider such as a museum, venue, or tour operator.
 */
export interface CatalogProvider {
  /** Unique identifier for the provider. */
  ProviderId: string
  /** Full official name of the provider entity. */
  ProviderName?: string
  /** Comprehensive description of the provider and its services. */
  ProviderDescription?: string
  /** Public-facing trade or commercial name. */
  ProviderCommercialName?: string
  /** Human-readable terms and conditions required for venue access. */
  ProviderAccessConditions?: string
  /** Numeric classification code for the provider type. */
  ProviderType?: number
  /** Absolute URL to the provider's logo image. */
  Logo?: string
  /** Keywords or categories associated with the provider. */
  Tags?: string[]
  /** Product bases managed and offered by this provider. */
  ProductBases?: CatalogProductBase[]
  /** Products that integrate services from multiple entities. */
  CombinedProducts?: unknown[]
  /** Additional dynamic properties returned by the API. */
  [key: string]: unknown
}

/**
 * Structure of the response from the product catalog endpoint.
 */
export interface CatalogResponse extends ExperticketBaseResponse {
  /** Collection of providers and their associated products. */
  Providers?: CatalogProvider[]
  /** ISO 8601 timestamp of when the catalog data was last synchronized. */
  CatalogLastUpdatedDateTime?: string
}

// ── Languages ─────────────────────────────────────────────────────

/**
 * Language supported by the Experticket platform.
 */
export interface Language {
  /** ISO 639-1 two-letter language code (e.g., "en"). */
  Code: string
  /** Name of the language written in English. */
  EnglishName: string
  /** Name of the language written in its own native script. */
  NativeName: string
}

/**
 * Response containing all available system languages.
 */
export interface LanguagesResponse extends ExperticketBaseResponse {
  /** List of languages supported for localized content. */
  Languages?: Language[]
}

// ── Tags ──────────────────────────────────────────────────────────

/**
 * Hierarchical tag used for classification and filtering.
 */
export interface Tag {
  /** Unique string identifier for the tag. */
  Id: string
  /** Internal numeric key used by the legacy system. */
  Key: number
  /** Localized display name of the tag. */
  Name: string
  /** Fully qualified path name including parent tags (e.g., "Category/Subcategory"). */
  PathName: string
  /** Nested child tags for building a hierarchy. */
  Children: Tag[]
}

/**
 * Response containing the complete tag hierarchy.
 */
export interface TagsResponse extends ExperticketBaseResponse {
  /** Root-level tags in the system hierarchy. */
  Tags?: Tag[]
}

// ── Last Updated ──────────────────────────────────────────────────

/**
 * Response indicating the last system update time.
 */
export interface LastUpdatedResponse extends ExperticketBaseResponse {
  /** ISO 8601 timestamp of the most recent system-wide update. */
  LastUpdatedDateTime?: string
}

// ── Available Capacity ────────────────────────────────────────────

/**
 * Remaining capacity for a specific item on a specific date.
 */
export interface CapacityItem {
  /** Identifier of the product base if the capacity is defined at the base level. */
  ProductBaseId?: string
  /** Identifier of the specific product if the capacity is defined at the product level. */
  ProductId?: string
  /** Identifier of the session if the capacity is defined for a time slot. */
  SessionId?: string
  /** ISO 8601 date string for which capacity is reported. */
  Date: string
  /** Number of remaining available slots. If undefined, capacity is unlimited. */
  AvailableCapacity?: number
  /** Current price applicable for the item on this date. */
  Price?: number
  /** Pricing mode applicable for this capacity entry. */
  PriceMode?: number
}

/**
 * Response returned when querying for available capacity.
 */
export interface AvailableCapacityResponse extends ExperticketBaseResponse {
  /** Capacity records grouped by product base identifiers. */
  ProductBases?: CapacityItem[]
  /** Capacity records grouped by individual product identifiers. */
  Products?: CapacityItem[]
  /** Capacity records grouped by session (time slot) identifiers. */
  Sessions?: CapacityItem[]
}

// ── Real-Time Prices ──────────────────────────────────────────────

/**
 * Payload required to calculate real-time prices for a selection.
 */
export interface RealTimePriceRequest {
  /** Partner identifier. */
  PartnerId?: string
  /** List of product IDs to consult. */
  ProductIds?: string[]
  /** The entry dates we wish to consult. ISO 8601 format (yyyy-MM-dd). */
  AccessDates?: string[]
  /** Start of input date range that we want to query. ISO 8601 format (yyyy-MM-dd). */
  StartDate?: string
  /** End of input date range that we want to query. ISO 8601 format (yyyy-MM-dd). */
  EndDate?: string
  /** Combined products array. */
  CombinedProducts?: {
    /** Combined product identifier. */
    CombinedProductId: string
    /** Array of products included in the combined product. */
    Products: {
      /** Product identifier. */
      ProductId: string
      /** Access date. ISO 8601 format (yyyy-MM-dd). */
      AccessDate: string
    }[]
  }[]
  /**
   * ISO 8601 date and time for the access.
   * @deprecated Use AccessDates, StartDate or EndDate instead.
   */
  AccessDateTime?: string
  /**
   * List of products to be priced.
   * @deprecated Use ProductIds instead.
   */
  Products?: {
    /** Identifier of the product. */
    ProductId: string
    /** Optional identifier for combined products. */
    CombinedProductId?: string
  }[]
}

/**
 * Dynamic price calculation for a product on a specific date.
 */
export interface RealTimePriceItem {
  /** Identifier of the product for which the price was calculated. */
  ProductId: string
  /** ISO 8601 date used for the calculation. */
  Date?: string
  /** Actual date of access if it differs from the selection date. */
  AccessDate?: string
  /** Final calculated numeric price. */
  Price: number
  /** Numeric identifier for the price mode. */
  PriceMode?: number
  /** Identifier of the parent combined product if applicable. */
  CombinedProductId?: string
  /** Indicates if the price was successfully calculated for this specific item. */
  Success?: boolean
  /** Error message describing why calculation failed for this item. */
  ErrorMessage?: string
}

/**
 * Response from the real-time pricing endpoint.
 */
export interface RealTimePricesResponse extends ExperticketBaseResponse {
  /** Collection of calculated real-time prices for the requested products. */
  ProductsRealTimePrices?: RealTimePriceItem[]
}

// ── Ticket Questions ──────────────────────────────────────────────

/**
 * Payload required to check required ticket questions.
 */
export interface TicketQuestionRequest {
  /** Partner identifier. */
  PartnerId?: string
  /** Array of products identifiers. */
  ProductIds?: string[]
  /** Array of identifier of the question profiles. */
  TicketsQuestionsProfileIds?: string[]
  /** Lenguaje code. */
  LanguageCode?: string | null
  /**
   * ISO 8601 access date and time.
   * @deprecated Use the documented fields instead.
   */
  AccessDateTime?: string
  /**
   * List of products to check.
   * @deprecated Use ProductIds instead.
   */
  Products?: {
    /** Identifier of the product. */
    ProductId: string
  }[]
}

/**
 * Predefined selectable value for a multi-choice ticket question.
 */
export interface TicketQuestionValue {
  /** Unique identifier for the value option. */
  Id?: string
  /** Localized display string for the option. */
  Value?: string
}

/**
 * Mandatory or optional question to be answered during reservation.
 */
export interface TicketQuestion {
  /** Unique identifier for the question. */
  Id: string
  /** Full text of the question to be displayed to the user. */
  Question: string
  /** Condensed version of the question text for mobile or summary views. */
  ShortQuestion?: string
  /** Indicates if an answer must be provided to proceed with the reservation. */
  Required?: boolean
  /** Expected primitive data type of the answer (e.g., "string", "int"). */
  DataType?: string
  /** List of valid options if the question is a multiple-choice type. */
  Values?: TicketQuestionValue[]
}

/**
 * Collection of questions grouped under a profile.
 */
export interface TicketQuestionsProfile {
  /** Unique identifier for the question profile. */
  Id: string
  /** Ordered list of questions contained in this profile. */
  Questions?: TicketQuestion[]
}

/**
 * Links a specific ticket to its required question profile.
 */
export interface TicketQuestionsTicket {
  /** Unique identifier of the ticket. */
  TicketId: string
  /** Identifier of the profile containing the questions for this ticket. */
  TicketQuestionsProfileId?: string
}

/**
 * Links a product to the questions required for its associated tickets.
 */
export interface TicketQuestionsProduct {
  /** Unique identifier of the product. */
  ProductId: string
  /** List of tickets belonging to this product that require answers to questions. */
  Tickets?: TicketQuestionsTicket[]
}

/**
 * Response containing all required questions for a selection of products.
 */
export interface TicketQuestionsResponse extends ExperticketBaseResponse {
  /** List of products and their associated ticket-level question requirements. */
  Products?: TicketQuestionsProduct[]
  /** Complete definitions for all question profiles referenced in the response. */
  TicketQuestionsProfiles?: TicketQuestionsProfile[]
}

// ── Reservation ───────────────────────────────────────────────────

/**
 * Data structure for reserving a specific product unit.
 */
export interface ReservationProductRequest {
  /** Identifier of the product to be reserved. */
  ProductId: string
  /** Total number of units to reserve. */
  Quantity: number
  /** Optional identifier if this product is part of a larger combined product. */
  CombinedProductId?: string | null
  /** List of detailed ticket-level data including mandatory question answers. */
  Tickets?: {
    /** Identifier of the specific ticket type. */
    TicketId: string
    /** Identifier of the selected session for this ticket instance. */
    SessionId?: string
    /** ISO 8601 date and time for the scheduled access. */
    AccessDateTime?: string
    /** Collection of answers to the questions defined in the ticket profile. */
    Questions?: {
      /** Identifier of the question being answered. */
      TicketQuestionId: string
      /** Provided answer if the question expects a string. */
      StringValue?: string
      /** Provided answer if the question expects a boolean. */
      BooleanValue?: boolean
      /** Provided answer if the question expects an ISO date string. */
      DateTimeValue?: string
      /** Provided answer if the question expects an integer. */
      IntegerValue?: number
      /** Provided answer if the question expects a decimal. */
      DecimalValue?: number
    }[]
  }[] | null
  /** Default ISO 8601 start time for access to this product. */
  AccessDateTime?: string | null
  /** Default ISO 8601 end time for access to this product. */
  AccessEndDateTime?: string | null
}

/**
 * Payload required to create a temporary reservation.
 */
export interface ReservationRequest {
  /** Partner API Key used for authentication. */
  ApiKey?: string
  /** Flag to indicate if the reservation should be processed as a test. */
  IsTest?: boolean
  /** Primary ISO 8601 access date and time for the entire reservation. */
  AccessDateTime: string
  /** Optional ISO 8601 end time for venue access. */
  AccessEndDateTime?: string
  /** List of products and their quantities to be reserved. */
  Products: ReservationProductRequest[]
  /** ISO language code preferred for any localized error or success messages. */
  LanguageCode?: string | null
}

/**
 * Reservation status and details for an individual product.
 */
/**
 * Rule that applies when cancelling a product.
 */
export interface CancellationRule {
  /** Number of hours in advance of access when this rule applies. */
  HoursInAdvanceOfAccess?: number
  /** Start of the date range when this rule applies. */
  FromInclusiveDateTime?: string
  /** End of the date range when this rule applies. */
  ToExclusiveDateTime?: string
  /** Percentage of the total amount that is non-refundable. */
  Percentage?: number
  /** Exact amount to be charged as a cancellation fee. */
  Amount?: number
}

/**
 * Describe the cancellation policies that apply when cancelling a sale.
 */
export interface CancellationConditions {
  /** Indicates if the customer can cancel for free at some point in time. */
  IsRefundable: boolean
  /** Rules that apply when cancelling. */
  Rules?: CancellationRule[]
}

export interface ReservationProductResponse {
  /** Unique identifier of the product. */
  ProductId: string
  /** Reserved quantity confirmed by the system. */
  Quantity: number
  /** Unit price applied at the moment of reservation. */
  Price?: number
  /** Numeric pricing mode identifier. */
  PriceMode?: number
  /** Indicates if the reservation for this specific product was successful. */
  Success: boolean
  /** Error message describing the failure if {@link ReservationProductResponse.Success} is false. */
  ErrorMessage?: string
  /** List of individual ticket instances generated for this product reservation. */
  Tickets?: { TicketId: string; SessionId?: string; AccessDateTime?: string }[]
  /** Rules and constraints applicable for cancelling this product reservation. */
  CancellationConditions?: CancellationConditions
}

/**
 * Response returned after a reservation attempt.
 */
export interface ReservationResponse extends ExperticketBaseResponse {
  /** Unique identifier for the created reservation session. */
  ReservationId?: string
  /** Number of minutes remaining before the reservation expires and is released. */
  MinutesToExpiry?: number
  /** Confirmed ISO 8601 access start time. */
  AccessDateTime?: string
  /** Confirmed ISO 8601 access end time. */
  AccessEndDateTime?: string
  /** Aggregate total price for all reserved products. */
  TotalPrice?: number
  /** Individual result details for each product included in the request. */
  Products?: ReservationProductResponse[]
}

// ── Transaction ───────────────────────────────────────────────────

/**
 * Payload to finalize a reservation into a permanent transaction.
 */
export interface TransactionCreateRequest {
  /** Partner API Key for authentication. */
  ApiKey?: string
  /** Flag to indicate if this is a test transaction. */
  IsTest?: boolean
  /** Identifier of the valid, non-expired reservation to be converted. */
  ReservationId: string
  /** Confirmed ISO 8601 access date and time. */
  AccessDateTime: string
  /** List of product identifiers to be included in the final sale. */
  Products: { ProductId: string }[]
}

/**
 * Specific ticket instance within a finalized transaction.
 */
export interface TransactionTicket {
  /** Unique internal identifier for the ticket instance. */
  TicketId: string
  /** Name of the ticket type. */
  TicketName?: string
  /** Unique code used by the end user for venue entry. */
  AccessCode?: string
  /** Code used for financial reporting and billing. */
  BillingCode?: string
  /** Identifier of the session the ticket is valid for. */
  SessionId?: string
  /** Confirmed ISO 8601 start time for access. */
  AccessDateTime?: string
  /** Confirmed ISO 8601 end time for access. */
  AccessEndDateTime?: string
  /** Internal tracking code used by the provider. */
  InternalCode?: string
  /** Identifier of the venue enclosure. */
  TicketEnclosureId?: string
  /** Name of the venue enclosure. */
  TicketEnclosureName?: string
  /** Recommendation message for the user regarding arrival or access time. */
  SuggestedAccessDateMessage?: string
}

/**
 * Product record within a finalized transaction.
 */
export interface TransactionProduct {
  /** Unique identifier of the product. */
  ProductId: string
  /** Human-readable name of the product. */
  ProductName?: string
  /** Primary access code associated with this product instance. */
  AccessCode?: string
  /** Identifier of the provider who owns the product. */
  ProviderId?: string
  /** Name of the provider. */
  ProviderName?: string
  /** Numeric classification code for the provider. */
  ProviderType?: number
  /** Final numeric price charged for this product. */
  Price?: number
  /** Original manufacturer's suggested retail price. */
  RetailPrice?: number
  /** Price amount before value-added tax is applied. */
  PriceWithoutVat?: number
  /** Numeric identifier for the pricing mode. */
  PriceMode?: number
  /** Current lifecycle status code of the product instance (e.g., active, cancelled). */
  Status?: number
  /** Identifier of the parent combined product if applicable. */
  CombinedProductId?: string
  /** Collection of individual tickets generated for this product. */
  Tickets?: TransactionTicket[]
  /** Finalized rules governing the cancellation of this product. */
  CancellationConditions?: CancellationConditions
}

/**
 * Completed sale or transaction record.
 *
 * @remarks
 * Contains the full details of a finalized purchase, including products and payment status.
 */
export interface Transaction {
  /** Unique identifier for the sale record. */
  SaleId?: string
  /** Alternative identifier for the transaction record. */
  TransactionId?: string
  /** Confirmed ISO 8601 access date and time. */
  AccessDateTime?: string
  /** ISO 8601 timestamp of when the transaction was officially created. */
  TransactionDateTime?: string
  /** ISO 8601 timestamp of when the transaction was cancelled, if applicable. */
  CancelledDateTime?: string | null
  /** Aggregate total price charged to the client. */
  TotalPrice?: number
  /** Aggregate total retail price (MSRP) for all items. */
  TotalRetailPrice?: number
  /** Aggregate total price before value-added tax. */
  TotalPriceWithoutVat?: number
  /** Numeric status code representing the current payment state. */
  PaymentStatus?: number
  /** Collection of products included in the sale. */
  Products?: TransactionProduct[]
  /** Metadata regarding the client who performed the purchase. */
  Client?: Record<string, unknown>
  /** Information regarding products that combine multiple services. */
  CombinedProducts?: unknown[]
  /** Additional dynamic properties returned by the API. */
  [key: string]: unknown
}

/**
 * Paginated response containing a list of transaction records.
 */
export interface TransactionListResponse extends ExperticketBaseResponse {
  /** Collection of transaction records for the requested page. */
  Transactions?: Transaction[]
  /** Index of the current page (1-based). */
  PageNumber?: number
  /** Maximum number of items per page. */
  PageSize?: number
  /** Total number of items matching the query across all pages. */
  TotalItemCount?: number
  /** Total number of available pages. */
  PageCount?: number
  /** Indicates if a page exists before the current one. */
  HasPreviousPage?: boolean
  /** Indicates if a page exists after the current one. */
  HasNextPage?: boolean
  /** Indicates if the current page is the first in the results. */
  IsFirstPage?: boolean
  /** Indicates if the current page is the last in the results. */
  IsLastPage?: boolean
  /** 1-based index of the first item on the current page. */
  FirstItemOnPage?: number
  /** 1-based index of the last item on the current page. */
  LastItemOnPage?: number
}

// ── Transaction Documents ─────────────────────────────────────────

/**
 * Downloadable document associated with a transaction.
 */
export interface TransactionDocument {
  /** Direct absolute URL to download the document file (typically PDF). */
  SalesDocumentUrl: string
  /** ISO language code in which the document is written. */
  LanguageCode?: string
}

/**
 * Response containing links to generated transaction documents.
 */
export interface TransactionDocumentsResponse extends ExperticketBaseResponse {
  /** List of generated documents available for download. */
  Documents?: TransactionDocument[]
}

// ── Access Codes ──────────────────────────────────────────────────

/**
 * Access code details for an individual ticket instance.
 */
export interface AccessCodeTicket {
  /** Unique identifier of the ticket instance. */
  Id: string
  /** String representation of the access code (e.g., barcode, QR data). */
  AccessCode?: string
  /** Numeric status code indicating the delivery state of the code. */
  DeliveryState?: number
  /** Internal tracking identifier for the access code. */
  InternalCode?: string
}

/**
 * Access code information grouped at the product level.
 */
export interface AccessCodeProduct {
  /** Unique identifier of the product instance. */
  Id: string
  /** Collection of access codes for the individual tickets under this product. */
  Tickets?: AccessCodeTicket[]
}

/**
 * Access code information grouped at the transaction level.
 */
export interface AccessCodeTransaction {
  /** Unique identifier of the transaction. */
  Id: string
  /** Collection of products and their associated access codes. */
  Products?: AccessCodeProduct[]
}

/**
 * Response returned when querying for transaction access codes.
 */
export interface AccessCodesResponse extends ExperticketBaseResponse {
  /** List of transactions and their complete access code hierarchies. */
  Transactions?: AccessCodeTransaction[]
}

// ── Cancellation ──────────────────────────────────────────────────

/**
 * Payload required to request the cancellation of a sale.
 */
export interface CancellationRequest {
  /** Partner API Key for authentication. */
  ApiKey?: string
  /** Flag to indicate if the cancellation should be processed in test mode. */
  IsTest?: boolean
  /** Identifier of the sale record to be cancelled. */
  SaleId: string
  /** Numeric reason code for the cancellation request. */
  Reason: number
  /** Detailed human-readable explanation for the cancellation. */
  ReasonComments?: string
}

/**
 * Response returned after creating a cancellation request.
 */
export interface CancellationRequestResponse extends ExperticketBaseResponse {
  /** Unique identifier for the newly created cancellation request. */
  CancellationRequestId?: string
}

/**
 * Record of a previously submitted cancellation request.
 */
export interface CancellationRequestItem {
  /** Unique identifier of the cancellation request. */
  CancellationRequestId: string
  /** Identifier of the sale associated with this request. */
  SaleId?: string
  /** Identifier assigned by the partner to the original sale. */
  PartnerSaleId?: string
  /** ISO 8601 timestamp of when the request was first created. */
  CreatedDateTime?: string
  /** ISO 8601 timestamp of the last update to this request. */
  UpdatedDateTime?: string
  /** Numeric status code of the request (e.g., pending, approved). */
  Status?: number
  /** Comments or notes regarding the current status of the request. */
  StatusComments?: string
}

/**
 * Paginated response containing a list of cancellation requests.
 */
export interface CancellationListResponse extends ExperticketBaseResponse {
  /** Collection of cancellation request items for the current page. */
  CancellationRequests?: CancellationRequestItem[]
  /** Index of the current page (1-based). */
  PageNumber?: number
  /** Maximum number of items per page. */
  PageSize?: number
  /** Indicates if a page exists before the current one. */
  HasPreviousPage?: boolean
  /** Indicates if a page exists after the current one. */
  HasNextPage?: boolean
  /** Indicates if the current page is the first in the results. */
  IsFirstPage?: boolean
}

/**
 * Response containing the last updated date and time for the catalog.
 */
export type CatalogLastUpdatedDateTimeResponse = LastUpdatedResponse

/**
 * Response for checking ticket questions.
 */
export type CheckTicketsQuestionsResponse = TicketQuestionsResponse

/**
 * Alias for creating a transaction response.
 */
export type TransactionCreateResponse = Transaction

/**
 * Alias for querying a transaction response.
 */
export type TransactionQueryResponse = TransactionListResponse

/**
 * Response for creating a cancellation request.
 */
export type CancellationRequestCreateResponse = CancellationRequestResponse

/**
 * Response for querying cancellation requests.
 */
export type CancellationRequestQueryResponse = CancellationListResponse
