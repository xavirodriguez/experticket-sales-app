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
  /** Indicates if the ticket is subject to quota. */
  isQuotaTicket?: boolean
  /** Identifier of the ticket enclosure. */
  ticketEnclosureId?: string
  /** Name of the ticket enclosure. */
  ticketEnclosureName?: string
  /** Identifier of the question profile for this ticket. */
  ticketQuestionsProfileId?: string
}

/**
 * Normalized session or time slot.
 */
export interface DomainSession {
  /** Unique session identifier. */
  sessionId: string
  /** ISO 8601 start time. */
  sessionTime?: string
  /** Descriptive content name. */
  sessionContentName?: string
  /** Indicates if capacity is limited. */
  hasLimitedCapacity?: boolean
}

/**
 * Normalized product definition.
 */
export interface DomainProduct {
  /** Unique product identifier. */
  productId: string
  /** Display name of the product. */
  productName?: string
  /** Detailed product description. */
  productDescription?: string
  /** Current price for the product. */
  price?: number
  /** Numeric price mode identifier. */
  priceMode?: number
  /** Access date criteria code. */
  accessDateCriteria?: number
  /** Dates with limited capacity. */
  daysWithLimitedCapacity?: string[]
  /** Tickets available under this product. */
  tickets?: DomainTicket[]
  /** Sessions available for this product. */
  sessions?: DomainSession[]
}

/**
 * Normalized product base grouping.
 */
export interface DomainProductBase {
  /** Unique product base identifier. */
  productBaseId: string
  /** Name of the product base. */
  productBaseName?: string
  /** Description of the product base. */
  productBaseDescription?: string
  /** Dates with limited capacity at the base level. */
  daysWithLimitedCapacity?: string[]
  /** Products belonging to this base. */
  products?: DomainProduct[]
}

/**
 * Normalized service provider.
 */
export interface DomainProvider {
  /** Unique provider identifier. */
  providerId: string
  /** Name of the provider. */
  providerName?: string
  /** Description of the provider. */
  providerDescription?: string
  /** Commercial trade name. */
  providerCommercialName?: string
  /** Access terms and conditions. */
  providerAccessConditions?: string
  /** Numeric provider classification code. */
  providerType?: number
  /** URL to the provider logo. */
  logo?: string
  /** List of associated tags. */
  tags?: string[]
  /** Product bases offered by the provider. */
  productBases?: DomainProductBase[]
}

/**
 * Normalized catalog data.
 */
export interface DomainCatalog extends DomainBase {
  /** List of providers and their products. */
  providers: DomainProvider[]
  /** ISO 8601 timestamp of last catalog update. */
  catalogLastUpdatedDateTime?: string
}

/**
 * Normalized language definition.
 */
export interface DomainLanguage {
  /** ISO language code. */
  code: string
  /** English name of the language. */
  englishName: string
  /** Native name of the language. */
  nativeName: string
}

/**
 * Normalized list of supported languages.
 */
export interface DomainLanguages extends DomainBase {
  /** List of available languages. */
  languages: DomainLanguage[]
}

/**
 * Normalized tag hierarchy item.
 */
export interface DomainTag {
  /** Unique tag identifier. */
  id: string
  /** Numeric system key. */
  key: number
  /** Localized tag name. */
  name: string
  /** Fully qualified path name. */
  pathName: string
  /** Nested child tags. */
  children: DomainTag[]
}

/**
 * Normalized tag hierarchy.
 */
export interface DomainTags extends DomainBase {
  /** List of root-level tags. */
  tags: DomainTag[]
}

/**
 * Normalized capacity information for an item.
 */
export interface DomainCapacityItem {
  /** Product base identifier if applicable. */
  productBaseId?: string
  /** Product identifier if applicable. */
  productId?: string
  /** Session identifier if applicable. */
  sessionId?: string
  /** ISO 8601 date. */
  date: string
  /** Remaining available slots. */
  availableCapacity?: number
  /** Current price. */
  price?: number
  /** Pricing mode identifier. */
  priceMode?: number
}

/**
 * Normalized capacity report.
 */
export interface DomainCapacity extends DomainBase {
  /** Capacity records for product bases. */
  productBases: DomainCapacityItem[]
  /** Capacity records for products. */
  products: DomainCapacityItem[]
  /** Capacity records for sessions. */
  sessions: DomainCapacityItem[]
}

/**
 * Normalized real-time price calculation.
 */
export interface DomainRealTimePrice {
  /** Identifier of the priced product. */
  productId: string
  /** Selection date. */
  date?: string
  /** Confirmed access date. */
  accessDate?: string
  /** Calculated numeric price. */
  price: number
  /** Price mode identifier. */
  priceMode?: number
  /** Indicates if calculation was successful. */
  success?: boolean
  /** Error message if calculation failed. */
  errorMessage?: string
}

/**
 * Normalized collection of real-time prices.
 */
export interface DomainRealTimePrices extends DomainBase {
  /** List of calculated prices. */
  prices: DomainRealTimePrice[]
}

/**
 * Normalized ticket question definition.
 */
export interface DomainTicketQuestion {
  /** Unique question identifier. */
  id: string
  /** Full text of the question. */
  question: string
  /** Short version of the question. */
  shortQuestion?: string
  /** Indicates if an answer is required. */
  required?: boolean
  /** Answer data type (e.g., string, int). */
  dataType?: string
  /** Valid options for choice-based questions. */
  values?: { id?: string; value?: string }[]
}

/**
 * Normalized question profile.
 */
export interface DomainTicketQuestionsProfile {
  /** Unique profile identifier. */
  id: string
  /** Ordered list of questions. */
  questions: DomainTicketQuestion[]
}

/**
 * Normalized question requirements for products.
 */
export interface DomainTicketQuestions extends DomainBase {
  /** Requirement mapping for products. */
  products: {
    /** Product identifier. */
    productId: string
    /** Ticket requirements. */
    tickets: {
      /** Ticket identifier. */
      ticketId: string
      /** Question profile identifier. */
      ticketQuestionsProfileId?: string
    }[]
  }[]
  /** Definitions for question profiles. */
  profiles: DomainTicketQuestionsProfile[]
}

/**
 * Normalized product reservation result.
 */
export interface DomainReservationProduct {
  /** Reserved product identifier. */
  productId: string
  /** Confirmed quantity. */
  quantity: number
  /** Applied unit price. */
  price?: number
  /** Indicates if reservation succeeded for this product. */
  success: boolean
  /** Error message if reservation failed. */
  errorMessage?: string
  /** Confirmed ticket instances. */
  tickets?: { ticketId: string; sessionId?: string; accessDateTime?: string }[]
}

/**
 * Normalized reservation session.
 */
export interface DomainReservation extends DomainBase {
  /** Unique reservation identifier. */
  reservationId?: string
  /** Minutes remaining until expiration. */
  minutesToExpiry?: number
  /** Confirmed ISO 8601 access time. */
  accessDateTime?: string
  /** Total price for all reserved items. */
  totalPrice?: number
  /** Detailed product results. */
  products: DomainReservationProduct[]
}

/**
 * Normalized transaction ticket instance.
 */
export interface DomainTransactionTicket {
  /** Unique ticket identifier. */
  ticketId: string
  /** Name of the ticket type. */
  ticketName?: string
  /** User-facing access code. */
  accessCode?: string
  /** Session identifier. */
  sessionId?: string
  /** Confirmed ISO 8601 access time. */
  accessDateTime?: string
  /** Provider's internal tracking code. */
  internalCode?: string
}

/**
 * Normalized transaction product record.
 */
export interface DomainTransactionProduct {
  /** Product identifier. */
  productId: string
  /** Display name of the product. */
  productName?: string
  /** Primary access code. */
  accessCode?: string
  /** Provider identifier. */
  providerId?: string
  /** Name of the provider. */
  providerName?: string
  /** Final charged price. */
  price?: number
  /** Lifecycle status code. */
  status?: number
  /** Ticket instances for this product. */
  tickets?: DomainTransactionTicket[]
}

/**
 * Normalized finalized transaction.
 */
export interface DomainTransaction {
  /** Unique sale identifier. */
  saleId?: string
  /** Alternative transaction identifier. */
  transactionId?: string
  /** Confirmed ISO 8601 access time. */
  accessDateTime?: string
  /** ISO 8601 creation timestamp. */
  transactionDateTime?: string
  /** Total numeric price. */
  totalPrice?: number
  /** Payment status code. */
  paymentStatus?: number
  /** Products included in the transaction. */
  products: DomainTransactionProduct[]
}

/**
 * Normalized list of transactions.
 */
export interface DomainTransactionList extends DomainBase {
  /** Collection of transaction records. */
  transactions: DomainTransaction[]
  /** Current page index. */
  pageNumber?: number
  /** Items per page. */
  pageSize?: number
  /** Total matching items. */
  totalItemCount?: number
  /** Total available pages. */
  pageCount?: number
}

/**
 * Normalized transaction document link.
 */
export interface DomainDocument {
  /** Absolute URL to the document. */
  url: string
  /** Document language code. */
  languageCode?: string
}

/**
 * Normalized collection of documents.
 */
export interface DomainDocuments extends DomainBase {
  /** List of available documents. */
  documents: DomainDocument[]
}

/**
 * Normalized access code hierarchy.
 */
export interface DomainAccessCode {
  /** Transaction identifier. */
  id: string
  /** Access codes grouped by product. */
  products: {
    /** Product identifier. */
    id: string
    /** Access codes grouped by ticket. */
    tickets: {
      /** Ticket identifier. */
      id: string
      /** User-facing access code. */
      accessCode?: string
      /** Internal tracking code. */
      internalCode?: string
    }[]
  }[]
}

/**
 * Normalized collection of access codes.
 */
export interface DomainAccessCodes extends DomainBase {
  /** Access codes for requested transactions. */
  transactions: DomainAccessCode[]
}

/**
 * Normalized cancellation request record.
 */
export interface DomainCancellationRequest {
  /** Unique request identifier. */
  id: string
  /** Sale identifier. */
  saleId?: string
  /** ISO 8601 creation timestamp. */
  createdDateTime?: string
  /** Status code. */
  status?: number
  /** Status-related comments. */
  statusComments?: string
}

/**
 * Normalized list of cancellation requests.
 */
export interface DomainCancellations extends DomainBase {
  /** Collection of cancellation requests. */
  requests: DomainCancellationRequest[]
}

/**
 * Normalized system update information.
 */
export interface DomainLastUpdated extends DomainBase {
  /** ISO 8601 timestamp of last update. */
  lastUpdatedDateTime?: string
}

// ── Adapter Functions ─────────────────────────────────────────────

/**
 * Normalizes a CatalogResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized catalog model.
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

function adaptProductBase(raw: CatalogProductBase): DomainProductBase {
  return {
    productBaseId: raw.ProductBaseId,
    productBaseName: raw.ProductBaseName,
    productBaseDescription: raw.ProductBaseDescription,
    daysWithLimitedCapacity: raw.DaysWithLimitedCapacity,
    products: (raw.Products || []).map(adaptProduct),
  }
}

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

function adaptSession(raw: CatalogSession): DomainSession {
  return {
    sessionId: raw.SessionId,
    sessionTime: raw.SessionTime,
    sessionContentName: raw.SessionContentName,
    hasLimitedCapacity: raw.HasLimitedCapacity,
  }
}

/**
 * Normalizes a LanguagesResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized languages model.
 */
export function adaptLanguages(raw: LanguagesResponse): DomainLanguages {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    languages: (raw.Languages || []).map(adaptLanguage),
  }
}

function adaptLanguage(raw: Language): DomainLanguage {
  return {
    code: raw.Code,
    englishName: raw.EnglishName,
    nativeName: raw.NativeName,
  }
}

/**
 * Normalizes a TagsResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized tags model.
 */
export function adaptTags(raw: TagsResponse): DomainTags {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    tags: (raw.Tags || []).map(adaptTag),
  }
}

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
 * Normalizes an AvailableCapacityResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized capacity model.
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
 * Normalizes a RealTimePricesResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized pricing model.
 */
export function adaptPrices(raw: RealTimePricesResponse): DomainRealTimePrices {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    prices: (raw.ProductsRealTimePrices || []).map(adaptRealTimePrice),
  }
}

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
 * Normalizes a TicketQuestionsResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized ticket questions model.
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

function adaptTicketQuestionsProduct(raw: TicketQuestionsProduct) {
  return {
    productId: raw.ProductId,
    tickets: (raw.Tickets || []).map((t) => ({
      ticketId: t.TicketId,
      ticketQuestionsProfileId: t.TicketQuestionsProfileId,
    })),
  }
}

function adaptProfile(raw: TicketQuestionsProfile): DomainTicketQuestionsProfile {
  return {
    id: raw.Id,
    questions: (raw.Questions || []).map(adaptTicketQuestion),
  }
}

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

function adaptTicketQuestionValue(v: TicketQuestionValue) {
  return { id: v.Id, value: v.Value }
}

/**
 * Normalizes a ReservationResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized reservation model.
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

interface RawReservationTicket {
  TicketId: string
  SessionId?: string
  AccessDateTime?: string
}

function adaptReservationTicket(raw: RawReservationTicket) {
  return {
    ticketId: raw.TicketId,
    sessionId: raw.SessionId,
    accessDateTime: raw.AccessDateTime,
  }
}

/**
 * Normalizes a TransactionListResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized transaction list model.
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
 * Normalizes a single Transaction.
 *
 * @param raw - Raw API response.
 * @returns Normalized transaction model.
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
 * Normalizes a TransactionDocumentsResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized documents model.
 */
export function adaptDocuments(raw: TransactionDocumentsResponse): DomainDocuments {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    documents: (raw.Documents || []).map(adaptTransactionDocument),
  }
}

function adaptTransactionDocument(raw: TransactionDocument): DomainDocument {
  return {
    url: raw.SalesDocumentUrl,
    languageCode: raw.LanguageCode,
  }
}

/**
 * Normalizes an AccessCodesResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized access codes model.
 */
export function adaptAccessCodes(raw: AccessCodesResponse): DomainAccessCodes {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    transactions: (raw.Transactions || []).map(adaptAccessCodeTransaction),
  }
}

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
 * Normalizes a CancellationListResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized cancellations model.
 */
export function adaptCancellations(raw: CancellationListResponse): DomainCancellations {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    requests: (raw.CancellationRequests || []).map(adaptCancellationRequest),
  }
}

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
 * Normalizes a LastUpdatedResponse.
 *
 * @param raw - Raw API response.
 * @returns Normalized last updated model.
 */
export function adaptLastUpdated(raw: LastUpdatedResponse): DomainLastUpdated {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    lastUpdatedDateTime: raw.LastUpdatedDateTime,
  }
}
