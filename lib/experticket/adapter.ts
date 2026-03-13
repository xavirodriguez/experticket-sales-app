import type {
  CatalogResponse,
  CatalogProvider,
  CatalogProductBase,
  CatalogProduct,
  CatalogTicket,
  CatalogSession,
  LanguagesResponse,
  Language,
  TagsResponse,
  Tag,
  AvailableCapacityResponse,
  CapacityItem,
  RealTimePricesResponse,
  RealTimePriceItem,
  TicketQuestionsResponse,
  TicketQuestionsProduct,
  TicketQuestionsProfile,
  TicketQuestion,
  TicketQuestionValue,
  ReservationResponse,
  ReservationProductResponse,
  TransactionListResponse,
  Transaction,
  TransactionProduct,
  TransactionTicket,
  TransactionDocumentsResponse,
  TransactionDocument,
  AccessCodesResponse,
  AccessCodeTransaction,
  CancellationListResponse,
  CancellationRequestItem,
  LastUpdatedResponse,
} from "./types"

/**
 * Adapter layer for normalizing Experticket API responses into domain models.
 *
 * @remarks
 * This module converts raw, uppercase-keyed API responses into camelCase domain models
 * used throughout the frontend application.
 *
 * @packageDocumentation
 */

// ── Domain Interfaces ─────────────────────────────────────────────

/**
 * Base properties shared by all domain models.
 */
export interface DomainBase {
  /** Indicates if the operation was successful. */
  success: boolean
  /** ISO 8601 timestamp of the response. */
  timestamp?: string
  /** Human-readable error message. */
  errorMessage?: string
}

/**
 * Normalized ticket definition.
 */
export interface DomainTicket {
  /** Unique ticket identifier. */
  ticketId: string
  /** Display name of the ticket. */
  ticketName?: string
  /** Indicates if the ticket is subject to quota restrictions. */
  isQuotaTicket?: boolean
  /** Identifier of the ticket enclosure. */
  ticketEnclosureId?: string
  /** Name of the ticket enclosure. */
  ticketEnclosureName?: string
  /** Identifier of the question profile containing mandatory fields for this ticket. */
  ticketQuestionsProfileId?: string
}

/**
 * Normalized session or time slot.
 */
export interface DomainSession {
  /** Unique session identifier. */
  sessionId: string
  /** ISO 8601 string representing the start time. */
  sessionTime?: string
  /** Descriptive name or content summary for the session. */
  sessionContentName?: string
  /** Indicates if the session has a fixed maximum capacity. */
  hasLimitedCapacity?: boolean
}

/**
 * Normalized product available for purchase.
 *
 * @remarks
 * Products are sellable units and contain associated tickets and sessions.
 */
export interface DomainProduct {
  /** Unique product identifier. */
  productId: string
  /** Display name of the product. */
  productName?: string
  /** Detailed multi-line description of the product. */
  productDescription?: string
  /** Current base price for the product. */
  price?: number
  /** Numeric identifier representing the pricing mode. */
  priceMode?: number
  /** Criteria used to determine valid access dates. */
  accessDateCriteria?: number
  /** List of ISO 8601 date strings with specific capacity constraints. */
  daysWithLimitedCapacity?: string[]
  /** Collection of tickets available under this product. */
  tickets?: DomainTicket[]
  /** Collection of time slots available for this product. */
  sessions?: DomainSession[]
}

/**
 * Normalized logical grouping of related products.
 *
 * @remarks
 * A product base can enforce capacity restrictions across all its child products.
 */
export interface DomainProductBase {
  /** Unique product base identifier. */
  productBaseId: string
  /** Name of the product base. */
  productBaseName?: string
  /** Detailed description of the product base grouping. */
  productBaseDescription?: string
  /** Dates where capacity is restricted at the product base level. */
  daysWithLimitedCapacity?: string[]
  /** List of individual products belonging to this base. */
  products?: DomainProduct[]
}

/**
 * Normalized service provider (e.g., museum, venue, tour operator).
 */
export interface DomainProvider {
  /** Unique provider identifier. */
  providerId: string
  /** Full name of the provider entity. */
  providerName?: string
  /** Comprehensive description of the provider and its services. */
  providerDescription?: string
  /** Public-facing trade or commercial name. */
  providerCommercialName?: string
  /** Human-readable terms and conditions for venue access. */
  providerAccessConditions?: string
  /** Numeric classification code for the provider type. */
  providerType?: number
  /** Absolute URL to the provider's logo image. */
  logo?: string
  /** Keywords or categories associated with the provider. */
  tags?: string[]
  /** Product bases managed and offered by this provider. */
  productBases?: DomainProductBase[]
}

/**
 * Normalized catalog data including providers and associated products.
 */
export interface DomainCatalog extends DomainBase {
  /** Collection of providers and their products. */
  providers: DomainProvider[]
  /** ISO 8601 timestamp of when the catalog was last updated. */
  catalogLastUpdatedDateTime?: string
}

/**
 * Normalized language supported by the platform.
 */
export interface DomainLanguage {
  /** ISO 639-1 two-letter language code (e.g., "en"). */
  code: string
  /** Name of the language in English. */
  englishName: string
  /** Name of the language in its own native script. */
  nativeName: string
}

/**
 * Normalized list of all supported system languages.
 */
export interface DomainLanguages extends DomainBase {
  /** List of languages supported for localized content. */
  languages: DomainLanguage[]
}

/**
 * Normalized hierarchical tag used for classification.
 */
export interface DomainTag {
  /** Unique string identifier for the tag. */
  id: string
  /** Internal numeric key used by the legacy system. */
  key: number
  /** Localized display name of the tag. */
  name: string
  /** Fully qualified path name including parents (e.g., "Category/Subcategory"). */
  pathName: string
  /** Nested child tags for building a hierarchy. */
  children: DomainTag[]
}

/**
 * Normalized complete tag hierarchy for classification and filtering.
 */
export interface DomainTags extends DomainBase {
  /** Root-level tags in the system hierarchy. */
  tags: DomainTag[]
}

/**
 * Normalized remaining capacity for a specific item on a specific date.
 */
export interface DomainCapacityItem {
  /** Identifier of the product base if the capacity is defined at the base level. */
  productBaseId?: string
  /** Identifier of the specific product if the capacity is defined at the product level. */
  productId?: string
  /** Identifier of the session if the capacity is defined for a time slot. */
  sessionId?: string
  /** ISO 8601 date string for which capacity is reported. */
  date: string
  /** Number of remaining available slots. If undefined, capacity is unlimited. */
  availableCapacity?: number
  /** Current price applicable for the item on this date. */
  price?: number
  /** Pricing mode applicable for this capacity entry. */
  priceMode?: number
}

/**
 * Normalized capacity report containing records for bases, products, and sessions.
 */
export interface DomainCapacity extends DomainBase {
  /** Capacity records grouped by product base identifiers. */
  productBases: DomainCapacityItem[]
  /** Capacity records grouped by individual product identifiers. */
  products: DomainCapacityItem[]
  /** Capacity records grouped by session (time slot) identifiers. */
  sessions: DomainCapacityItem[]
}

/**
 * Normalized dynamic price calculation for a product on a specific date.
 */
export interface DomainRealTimePrice {
  /** Identifier of the product for which the price was calculated. */
  productId: string
  /** ISO 8601 selection date used for the calculation. */
  date?: string
  /** Actual date of access if it differs from the selection date. */
  accessDate?: string
  /** Final calculated numeric price. */
  price: number
  /** Numeric identifier for the price mode. */
  priceMode?: number
  /** Indicates if the price was successfully calculated for this specific item. */
  success?: boolean
  /** Error message describing why calculation failed for this item. */
  errorMessage?: string
}

/**
 * Normalized collection of calculated real-time prices.
 */
export interface DomainRealTimePrices extends DomainBase {
  /** Collection of calculated real-time prices for the requested products. */
  prices: DomainRealTimePrice[]
}

/**
 * Normalized mandatory or optional question to be answered during reservation.
 */
export interface DomainTicketQuestion {
  /** Unique identifier for the question. */
  id: string
  /** Full text of the question to be displayed to the user. */
  question: string
  /** Condensed version of the question text for mobile or summary views. */
  shortQuestion?: string
  /** Indicates if an answer must be provided to proceed with the reservation. */
  required?: boolean
  /** Expected primitive data type of the answer (e.g., "string", "int"). */
  dataType?: string
  /** List of valid options if the question is a multiple-choice type. */
  values?: { id?: string; value?: string }[]
}

/**
 * Normalized collection of questions grouped under a profile.
 */
export interface DomainTicketQuestionsProfile {
  /** Unique identifier for the question profile. */
  id: string
  /** Ordered list of questions contained in this profile. */
  questions: DomainTicketQuestion[]
}

/**
 * Normalized question requirements and definitions for a selection of products.
 */
export interface DomainTicketQuestions extends DomainBase {
  /** List of products and their associated ticket-level question requirements. */
  products: {
    /** Unique identifier of the product. */
    productId: string
    /** List of tickets belonging to this product that require answers. */
    tickets: {
      /** Unique identifier of the ticket. */
      ticketId: string
      /** Identifier of the profile containing the questions for this ticket. */
      ticketQuestionsProfileId?: string
    }[]
  }[]
  /** Complete definitions for all question profiles referenced in the response. */
  profiles: DomainTicketQuestionsProfile[]
}

/**
 * Normalized reservation status and details for an individual product.
 */
export interface DomainReservationProduct {
  /** Unique identifier of the product. */
  productId: string
  /** Reserved quantity confirmed by the system. */
  quantity: number
  /** Unit price applied at the moment of reservation. */
  price?: number
  /** Indicates if the reservation for this specific product was successful. */
  success: boolean
  /** Error message describing the failure if success is false. */
  errorMessage?: string
  /** List of individual ticket instances generated for this product reservation. */
  tickets?: { ticketId: string; sessionId?: string; accessDateTime?: string }[]
}

/**
 * Normalized reservation session details.
 */
export interface DomainReservation extends DomainBase {
  /** Unique identifier for the created reservation session. */
  reservationId?: string
  /** Number of minutes remaining before the reservation expires and is released. */
  minutesToExpiry?: number
  /** Confirmed ISO 8601 access start time. */
  accessDateTime?: string
  /** Aggregate total price for all reserved products. */
  totalPrice?: number
  /** Individual result details for each product included in the reservation. */
  products: DomainReservationProduct[]
}

/**
 * Normalized specific ticket instance within a finalized transaction.
 */
export interface DomainTransactionTicket {
  /** Unique internal identifier for the ticket instance. */
  ticketId: string
  /** Name of the ticket type. */
  ticketName?: string
  /** Unique code used by the end user for venue entry. */
  accessCode?: string
  /** Identifier of the session the ticket is valid for. */
  sessionId?: string
  /** Confirmed ISO 8601 start time for access. */
  accessDateTime?: string
  /** Internal tracking code used by the provider. */
  internalCode?: string
}

/**
 * Normalized product record within a finalized transaction.
 */
export interface DomainTransactionProduct {
  /** Unique identifier of the product. */
  productId: string
  /** Human-readable name of the product. */
  productName?: string
  /** Primary access code associated with this product instance. */
  accessCode?: string
  /** Identifier of the provider who owns the product. */
  providerId?: string
  /** Name of the provider. */
  providerName?: string
  /** Final numeric price charged for this product. */
  price?: number
  /** Current lifecycle status code of the product instance. */
  status?: number
  /** Collection of individual tickets generated for this product. */
  tickets?: DomainTransactionTicket[]
}

/**
 * Normalized finalized sale or transaction record.
 */
export interface DomainTransaction {
  /** Unique identifier for the sale record. */
  saleId?: string
  /** Alternative identifier for the transaction record. */
  transactionId?: string
  /** Confirmed ISO 8601 access date and time. */
  accessDateTime?: string
  /** ISO 8601 timestamp of when the transaction was officially created. */
  transactionDateTime?: string
  /** Aggregate total price charged to the client. */
  totalPrice?: number
  /** Numeric status code representing the current payment state. */
  paymentStatus?: number
  /** Collection of products included in the sale. */
  products: DomainTransactionProduct[]
}

/**
 * Normalized paginated response containing a list of transaction records.
 */
export interface DomainTransactionList extends DomainBase {
  /** Collection of transaction records for the requested page. */
  transactions: DomainTransaction[]
  /** Index of the current page (1-based). */
  pageNumber?: number
  /** Maximum number of items per page. */
  pageSize?: number
  /** Total number of items matching the query across all pages. */
  totalItemCount?: number
  /** Total number of available pages. */
  pageCount?: number
}

/**
 * Normalized downloadable document associated with a transaction.
 */
export interface DomainDocument {
  /** Direct absolute URL to download the document file (typically PDF). */
  url: string
  /** ISO language code in which the document is written. */
  languageCode?: string
}

/**
 * Normalized response containing links to generated transaction documents.
 */
export interface DomainDocuments extends DomainBase {
  /** List of generated documents available for download. */
  documents: DomainDocument[]
}

/**
 * Normalized access code hierarchy at the transaction level.
 */
export interface DomainAccessCode {
  /** Unique identifier of the transaction. */
  id: string
  /** Collection of products and their associated access codes. */
  products: {
    /** Unique identifier of the product instance. */
    id: string
    /** Collection of access codes for the individual tickets. */
    tickets: {
      /** Unique identifier of the ticket instance. */
      id: string
      /** String representation of the access code (e.g., barcode). */
      accessCode?: string
      /** Internal tracking identifier for the access code. */
      internalCode?: string
    }[]
  }[]
}

/**
 * Normalized response containing transaction access codes.
 */
export interface DomainAccessCodes extends DomainBase {
  /** List of transactions and their complete access code hierarchies. */
  transactions: DomainAccessCode[]
}

/**
 * Normalized record of a previously submitted cancellation request.
 */
export interface DomainCancellationRequest {
  /** Unique identifier of the cancellation request. */
  id: string
  /** Identifier of the sale associated with this request. */
  saleId?: string
  /** ISO 8601 timestamp of when the request was first created. */
  createdDateTime?: string
  /** Numeric status code of the request (e.g., pending, approved). */
  status?: number
  /** Comments or notes regarding the current status of the request. */
  statusComments?: string
}

/**
 * Normalized paginated response containing a list of cancellation requests.
 */
export interface DomainCancellations extends DomainBase {
  /** Collection of cancellation request items for the current page. */
  requests: DomainCancellationRequest[]
}

/**
 * Normalized response indicating the last system update time.
 */
export interface DomainLastUpdated extends DomainBase {
  /** ISO 8601 timestamp of the most recent system-wide update. */
  lastUpdatedDateTime?: string
}

// ── Adapter Functions ─────────────────────────────────────────────

/**
 * Normalizes a {@link CatalogResponse} into a {@link DomainCatalog}.
 *
 * @param raw - Raw API response from the catalog endpoint.
 * @returns Normalized catalog including providers and associated products.
 *
 * @example
 * ```typescript
 * const domainCatalog = adaptCatalog(rawResponse);
 * ```
 */
export function adaptCatalog(raw: CatalogResponse): DomainCatalog {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    catalogLastUpdatedDateTime: raw.CatalogLastUpdatedDateTime,
    providers: (raw.Providers || []).map(adaptProvider),
  }
}

/**
 * Normalizes a {@link CatalogProvider} into a {@link DomainProvider}.
 *
 * @param raw - Raw provider data from the API.
 * @returns Normalized provider domain model.
 *
 * @internal
 */
function adaptProvider(raw: CatalogProvider): DomainProvider {
  return {
    providerId: raw.ProviderId,
    providerName: raw.ProviderName,
    providerDescription: raw.ProviderDescription,
    providerCommercialName: raw.ProviderCommercialName,
    providerAccessConditions: raw.ProviderAccessConditions,
    providerType: raw.ProviderType,
    logo: raw.Logo,
    tags: raw.Tags,
    productBases: (raw.ProductBases || []).map(adaptProductBase),
  }
}

/**
 * Normalizes a {@link CatalogProductBase} into a {@link DomainProductBase}.
 *
 * @param raw - Raw product base data from the API.
 * @returns Normalized product base domain model.
 *
 * @internal
 */
function adaptProductBase(raw: CatalogProductBase): DomainProductBase {
  return {
    productBaseId: raw.ProductBaseId,
    productBaseName: raw.ProductBaseName,
    productBaseDescription: raw.ProductBaseDescription,
    daysWithLimitedCapacity: raw.DaysWithLimitedCapacity,
    products: (raw.Products || []).map(adaptProduct),
  }
}

/**
 * Normalizes a {@link CatalogProduct} into a {@link DomainProduct}.
 *
 * @param raw - Raw product data from the API.
 * @returns Normalized product domain model.
 *
 * @internal
 */
function adaptProduct(raw: CatalogProduct): DomainProduct {
  return {
    productId: raw.ProductId,
    productName: raw.ProductName,
    productDescription: raw.ProductDescription,
    price: raw.Price,
    priceMode: raw.PriceMode,
    accessDateCriteria: raw.AccessDateCriteria,
    daysWithLimitedCapacity: raw.DaysWithLimitedCapacity,
    tickets: (raw.Tickets || []).map(adaptTicket),
    sessions: (raw.Sessions || []).map(adaptSession),
  }
}

/**
 * Normalizes a {@link CatalogTicket} into a {@link DomainTicket}.
 *
 * @param raw - Raw ticket data from the API.
 * @returns Normalized ticket domain model.
 *
 * @internal
 */
function adaptTicket(raw: CatalogTicket): DomainTicket {
  return {
    ticketId: raw.TicketId,
    ticketName: raw.TicketName,
    isQuotaTicket: raw.IsQuotaTicket,
    ticketEnclosureId: raw.TicketEnclosureId,
    ticketEnclosureName: raw.TicketEnclosureName,
    ticketQuestionsProfileId: raw.TicketQuestionsProfileId,
  }
}

/**
 * Normalizes a {@link CatalogSession} into a {@link DomainSession}.
 *
 * @param raw - Raw session data from the API.
 * @returns Normalized session domain model.
 *
 * @internal
 */
function adaptSession(raw: CatalogSession): DomainSession {
  return {
    sessionId: raw.SessionId,
    sessionTime: raw.SessionTime,
    sessionContentName: raw.SessionContentName,
    hasLimitedCapacity: raw.HasLimitedCapacity,
  }
}

/**
 * Normalizes a {@link LanguagesResponse} into a {@link DomainLanguages} model.
 *
 * @param raw - Raw API response containing available languages.
 * @returns Normalized list of supported platform languages.
 *
 * @example
 * ```typescript
 * const domainLanguages = adaptLanguages(rawResponse);
 * ```
 */
export function adaptLanguages(raw: LanguagesResponse): DomainLanguages {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    languages: (raw.Languages || []).map(adaptLanguage),
  }
}

/**
 * Normalizes a {@link Language} into a {@link DomainLanguage}.
 *
 * @param raw - Raw language data from the API.
 * @returns Normalized language domain model.
 *
 * @internal
 */
function adaptLanguage(raw: Language): DomainLanguage {
  return {
    code: raw.Code,
    englishName: raw.EnglishName,
    nativeName: raw.NativeName,
  }
}

/**
 * Normalizes a {@link TagsResponse} into a {@link DomainTags} model.
 *
 * @param raw - Raw API response containing the tag hierarchy.
 * @returns Normalized hierarchical tag tree.
 *
 * @example
 * ```typescript
 * const domainTags = adaptTags(rawResponse);
 * ```
 */
export function adaptTags(raw: TagsResponse): DomainTags {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    tags: (raw.Tags || []).map(adaptTag),
  }
}

/**
 * Normalizes a {@link Tag} into a {@link DomainTag}.
 *
 * @param raw - Raw tag data from the API.
 * @returns Normalized tag domain model.
 *
 * @internal
 */
function adaptTag(raw: Tag): DomainTag {
  return {
    id: raw.Id,
    key: raw.Key,
    name: raw.Name,
    pathName: raw.PathName,
    children: (raw.Children || []).map(adaptTag),
  }
}

/**
 * Normalizes an {@link AvailableCapacityResponse} into a {@link DomainCapacity} model.
 *
 * @param raw - Raw API response containing capacity information.
 * @returns Normalized capacity report for bases, products, and sessions.
 *
 * @example
 * ```typescript
 * const domainCapacity = adaptCapacity(rawResponse);
 * ```
 */
export function adaptCapacity(raw: AvailableCapacityResponse): DomainCapacity {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    productBases: (raw.ProductBases || []).map(adaptCapacityItem),
    products: (raw.Products || []).map(adaptCapacityItem),
    sessions: (raw.Sessions || []).map(adaptCapacityItem),
  }
}

/**
 * Normalizes a {@link CapacityItem} into a {@link DomainCapacityItem}.
 *
 * @param item - Raw capacity data from the API.
 * @returns Normalized capacity item domain model.
 *
 * @internal
 */
function adaptCapacityItem(item: CapacityItem): DomainCapacityItem {
  return {
    productBaseId: item.ProductBaseId,
    productId: item.ProductId,
    sessionId: item.SessionId,
    date: item.Date,
    availableCapacity: item.AvailableCapacity,
    price: item.Price,
    priceMode: item.PriceMode,
  }
}

/**
 * Normalizes a {@link RealTimePricesResponse} into a {@link DomainRealTimePrices} model.
 *
 * @param raw - Raw API response from the pricing endpoint.
 * @returns Normalized collection of calculated real-time prices.
 *
 * @example
 * ```typescript
 * const domainPrices = adaptPrices(rawResponse);
 * ```
 */
export function adaptPrices(raw: RealTimePricesResponse): DomainRealTimePrices {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    prices: (raw.ProductsRealTimePrices || []).map(adaptRealTimePrice),
  }
}

/**
 * Normalizes a {@link RealTimePriceItem} into a {@link DomainRealTimePrice}.
 *
 * @param item - Raw real-time price data from the API.
 * @returns Normalized real-time price domain model.
 *
 * @internal
 */
function adaptRealTimePrice(item: RealTimePriceItem): DomainRealTimePrice {
  return {
    productId: item.ProductId,
    date: item.Date,
    accessDate: item.AccessDate,
    price: item.Price,
    priceMode: item.PriceMode,
    success: item.Success,
    errorMessage: item.ErrorMessage,
  }
}

/**
 * Normalizes a {@link TicketQuestionsResponse} into a {@link DomainTicketQuestions} model.
 *
 * @param raw - Raw API response containing required questions.
 * @returns Normalized ticket questions and profiles.
 *
 * @example
 * ```typescript
 * const domainQuestions = adaptQuestions(rawResponse);
 * ```
 */
export function adaptQuestions(raw: TicketQuestionsResponse): DomainTicketQuestions {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    products: (raw.Products || []).map(adaptTicketQuestionsProduct),
    profiles: (raw.TicketQuestionsProfiles || []).map(adaptProfile),
  }
}

/**
 * Normalizes a {@link TicketQuestionsProduct} into a domain-specific product question requirement.
 *
 * @param raw - Raw product question requirement from the API.
 * @returns Normalized product question requirement.
 *
 * @internal
 */
function adaptTicketQuestionsProduct(raw: TicketQuestionsProduct) {
  return {
    productId: raw.ProductId,
    tickets: (raw.Tickets || []).map((t) => ({
      ticketId: t.TicketId,
      ticketQuestionsProfileId: t.TicketQuestionsProfileId,
    })),
  }
}

/**
 * Normalizes a {@link TicketQuestionsProfile} into a {@link DomainTicketQuestionsProfile}.
 *
 * @param raw - Raw question profile from the API.
 * @returns Normalized question profile domain model.
 *
 * @internal
 */
function adaptProfile(raw: TicketQuestionsProfile): DomainTicketQuestionsProfile {
  return {
    id: raw.Id,
    questions: (raw.Questions || []).map(adaptTicketQuestion),
  }
}

/**
 * Normalizes a {@link TicketQuestion} into a {@link DomainTicketQuestion}.
 *
 * @param raw - Raw question data from the API.
 * @returns Normalized question domain model.
 *
 * @internal
 */
function adaptTicketQuestion(raw: TicketQuestion): DomainTicketQuestion {
  return {
    id: raw.Id,
    question: raw.Question,
    shortQuestion: raw.ShortQuestion,
    required: raw.Required,
    dataType: raw.DataType,
    values: (raw.Values || []).map(adaptTicketQuestionValue),
  }
}

/**
 * Normalizes a {@link TicketQuestionValue} into a domain-specific selectable option.
 *
 * @param v - Raw selectable value from the API.
 * @returns Normalized selectable option.
 *
 * @internal
 */
function adaptTicketQuestionValue(v: TicketQuestionValue) {
  return { id: v.Id, value: v.Value }
}

/**
 * Normalizes a {@link ReservationResponse} into a {@link DomainReservation} model.
 *
 * @param raw - Raw API response from the reservation endpoint.
 * @returns Normalized reservation session details.
 *
 * @example
 * ```typescript
 * const domainReservation = adaptReservation(rawResponse);
 * ```
 */
export function adaptReservation(raw: ReservationResponse): DomainReservation {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    reservationId: raw.ReservationId,
    minutesToExpiry: raw.MinutesToExpiry,
    accessDateTime: raw.AccessDateTime,
    totalPrice: raw.TotalPrice,
    products: (raw.Products || []).map(adaptReservationProduct),
  }
}

/**
 * Normalizes a {@link ReservationProductResponse} into a {@link DomainReservationProduct}.
 *
 * @param raw - Raw reservation product data from the API.
 * @returns Normalized reservation product domain model.
 *
 * @internal
 */
function adaptReservationProduct(raw: ReservationProductResponse): DomainReservationProduct {
  return {
    productId: raw.ProductId,
    quantity: raw.Quantity,
    price: raw.Price,
    success: raw.Success,
    errorMessage: raw.ErrorMessage,
    tickets: (raw.Tickets || []).map(adaptReservationTicket),
  }
}

/**
 * Raw structure of a ticket within a reservation response.
 * @internal
 */
interface RawReservationTicket {
  TicketId: string
  SessionId?: string
  AccessDateTime?: string
}

/**
 * Normalizes a {@link RawReservationTicket} into a domain-specific ticket instance.
 *
 * @param raw - Raw reservation ticket data.
 * @returns Normalized ticket instance.
 *
 * @internal
 */
function adaptReservationTicket(raw: RawReservationTicket) {
  return {
    ticketId: raw.TicketId,
    sessionId: raw.SessionId,
    accessDateTime: raw.AccessDateTime,
  }
}

/**
 * Normalizes a {@link TransactionListResponse} into a {@link DomainTransactionList} model.
 *
 * @param raw - Raw API response containing multiple transaction records.
 * @returns Normalized paginated list of transactions.
 *
 * @example
 * ```typescript
 * const domainTransactionList = adaptTransactionList(rawResponse);
 * ```
 */
export function adaptTransactionList(raw: TransactionListResponse): DomainTransactionList {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    transactions: (raw.Transactions || []).map(adaptTransaction),
    pageNumber: raw.PageNumber,
    pageSize: raw.PageSize,
    totalItemCount: raw.TotalItemCount,
    pageCount: raw.PageCount,
  }
}

/**
 * Normalizes a single {@link Transaction} object into a {@link DomainTransaction}.
 *
 * @param raw - Raw API object representing a single transaction.
 * @returns Normalized finalized transaction record.
 *
 * @example
 * ```typescript
 * const domainTransaction = adaptTransaction(rawTransaction);
 * ```
 */
export function adaptTransaction(raw: Transaction): DomainTransaction {
  return {
    saleId: raw.SaleId,
    transactionId: raw.TransactionId,
    accessDateTime: raw.AccessDateTime,
    transactionDateTime: raw.TransactionDateTime,
    totalPrice: raw.TotalPrice,
    paymentStatus: raw.PaymentStatus,
    products: (raw.Products || []).map(adaptTransactionProduct),
  }
}

/**
 * Normalizes a {@link TransactionProduct} into a {@link DomainTransactionProduct}.
 *
 * @param raw - Raw transaction product data from the API.
 * @returns Normalized transaction product domain model.
 *
 * @internal
 */
function adaptTransactionProduct(raw: TransactionProduct): DomainTransactionProduct {
  return {
    productId: raw.ProductId,
    productName: raw.ProductName,
    accessCode: raw.AccessCode,
    providerId: raw.ProviderId,
    providerName: raw.ProviderName,
    price: raw.Price,
    status: raw.Status,
    tickets: (raw.Tickets || []).map(adaptTransactionTicket),
  }
}

/**
 * Normalizes a {@link TransactionTicket} into a {@link DomainTransactionTicket}.
 *
 * @param raw - Raw transaction ticket data from the API.
 * @returns Normalized transaction ticket domain model.
 *
 * @internal
 */
function adaptTransactionTicket(raw: TransactionTicket): DomainTransactionTicket {
  return {
    ticketId: raw.TicketId,
    ticketName: raw.TicketName,
    accessCode: raw.AccessCode,
    sessionId: raw.SessionId,
    accessDateTime: raw.AccessDateTime,
    internalCode: raw.InternalCode,
  }
}

/**
 * Normalizes a {@link TransactionDocumentsResponse} into a {@link DomainDocuments} model.
 *
 * @param raw - Raw API response containing document links.
 * @returns Normalized list of transaction documents.
 *
 * @example
 * ```typescript
 * const domainDocuments = adaptDocuments(rawResponse);
 * ```
 */
export function adaptDocuments(raw: TransactionDocumentsResponse): DomainDocuments {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    documents: (raw.Documents || []).map(adaptTransactionDocument),
  }
}

/**
 * Normalizes a {@link TransactionDocument} into a {@link DomainDocument}.
 *
 * @param raw - Raw transaction document data from the API.
 * @returns Normalized document domain model.
 *
 * @internal
 */
function adaptTransactionDocument(raw: TransactionDocument): DomainDocument {
  return {
    url: raw.SalesDocumentUrl,
    languageCode: raw.LanguageCode,
  }
}

/**
 * Normalizes an {@link AccessCodesResponse} into a {@link DomainAccessCodes} model.
 *
 * @param raw - Raw API response containing access code hierarchies.
 * @returns Normalized access code details for transactions.
 *
 * @example
 * ```typescript
 * const domainAccessCodes = adaptAccessCodes(rawResponse);
 * ```
 */
export function adaptAccessCodes(raw: AccessCodesResponse): DomainAccessCodes {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    transactions: (raw.Transactions || []).map(adaptAccessCodeTransaction),
  }
}

/**
 * Normalizes an {@link AccessCodeTransaction} into a {@link DomainAccessCode}.
 *
 * @param raw - Raw access code transaction data from the API.
 * @returns Normalized access code transaction domain model.
 *
 * @internal
 */
function adaptAccessCodeTransaction(raw: AccessCodeTransaction): DomainAccessCode {
  return {
    id: raw.Id,
    products: (raw.Products || []).map((p) => ({
      id: p.Id,
      tickets: (p.Tickets || []).map((tk) => ({
        id: tk.Id,
        accessCode: tk.AccessCode,
        internalCode: tk.InternalCode,
      })),
    })),
  }
}

/**
 * Normalizes a {@link CancellationListResponse} into a {@link DomainCancellations} model.
 *
 * @param raw - Raw API response containing cancellation requests.
 * @returns Normalized list of cancellation request items.
 *
 * @example
 * ```typescript
 * const domainCancellations = adaptCancellations(rawResponse);
 * ```
 */
export function adaptCancellations(raw: CancellationListResponse): DomainCancellations {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    requests: (raw.CancellationRequests || []).map(adaptCancellationRequest),
  }
}

/**
 * Normalizes a {@link CancellationRequestItem} into a {@link DomainCancellationRequest}.
 *
 * @param raw - Raw cancellation request item from the API.
 * @returns Normalized cancellation request domain model.
 *
 * @internal
 */
function adaptCancellationRequest(raw: CancellationRequestItem): DomainCancellationRequest {
  return {
    id: raw.CancellationRequestId,
    saleId: raw.SaleId,
    createdDateTime: raw.CreatedDateTime,
    status: raw.Status,
    statusComments: raw.StatusComments,
  }
}

/**
 * Normalizes a {@link LastUpdatedResponse} into a {@link DomainLastUpdated} model.
 *
 * @param raw - Raw API response containing the update timestamp.
 * @returns Normalized system last update information.
 *
 * @example
 * ```typescript
 * const domainLastUpdated = adaptLastUpdated(rawResponse);
 * ```
 */
export function adaptLastUpdated(raw: LastUpdatedResponse): DomainLastUpdated {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    lastUpdatedDateTime: raw.LastUpdatedDateTime,
  }
}
