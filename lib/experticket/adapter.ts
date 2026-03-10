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
 * @module experticket-adapter
 * @description Adapter layer for normalizing Experticket API responses into camelCase domain models.
 */

// ── Domain Interfaces ─────────────────────────────────────────────

export interface DomainBase {
  success: boolean
  timestamp?: string
  errorMessage?: string
}

export interface DomainTicket {
  ticketId: string
  ticketName?: string
  isQuotaTicket?: boolean
  ticketEnclosureId?: string
  ticketEnclosureName?: string
  ticketQuestionsProfileId?: string
}

export interface DomainSession {
  sessionId: string
  sessionTime?: string
  sessionContentName?: string
  hasLimitedCapacity?: boolean
}

export interface DomainProduct {
  productId: string
  productName?: string
  productDescription?: string
  price?: number
  priceMode?: number
  accessDateCriteria?: number
  daysWithLimitedCapacity?: string[]
  tickets?: DomainTicket[]
  sessions?: DomainSession[]
}

export interface DomainProductBase {
  productBaseId: string
  productBaseName?: string
  productBaseDescription?: string
  daysWithLimitedCapacity?: string[]
  products?: DomainProduct[]
}

export interface DomainProvider {
  providerId: string
  providerName?: string
  providerDescription?: string
  providerCommercialName?: string
  providerAccessConditions?: string
  providerType?: number
  logo?: string
  tags?: string[]
  productBases?: DomainProductBase[]
}

export interface DomainCatalog extends DomainBase {
  providers: DomainProvider[]
  catalogLastUpdatedDateTime?: string
}

export interface DomainLanguage {
  code: string
  englishName: string
  nativeName: string
}

export interface DomainLanguages extends DomainBase {
  languages: DomainLanguage[]
}

export interface DomainTag {
  id: string
  key: number
  name: string
  pathName: string
  children: DomainTag[]
}

export interface DomainTags extends DomainBase {
  tags: DomainTag[]
}

export interface DomainCapacityItem {
  productBaseId?: string
  productId?: string
  sessionId?: string
  date: string
  availableCapacity?: number
  price?: number
  priceMode?: number
}

export interface DomainCapacity extends DomainBase {
  productBases: DomainCapacityItem[]
  products: DomainCapacityItem[]
  sessions: DomainCapacityItem[]
}

export interface DomainRealTimePrice {
  productId: string
  date?: string
  accessDate?: string
  price: number
  priceMode?: number
  success?: boolean
  errorMessage?: string
}

export interface DomainRealTimePrices extends DomainBase {
  prices: DomainRealTimePrice[]
}

export interface DomainTicketQuestion {
  id: string
  question: string
  shortQuestion?: string
  required?: boolean
  dataType?: string
  values?: { id?: string; value?: string }[]
}

export interface DomainTicketQuestionsProfile {
  id: string
  questions: DomainTicketQuestion[]
}

export interface DomainTicketQuestions extends DomainBase {
  products: {
    productId: string
    tickets: { ticketId: string; ticketQuestionsProfileId?: string }[]
  }[]
  profiles: DomainTicketQuestionsProfile[]
}

export interface DomainReservationProduct {
  productId: string
  quantity: number
  price?: number
  success: boolean
  errorMessage?: string
  tickets?: { ticketId: string; sessionId?: string; accessDateTime?: string }[]
}

export interface DomainReservation extends DomainBase {
  reservationId?: string
  minutesToExpiry?: number
  accessDateTime?: string
  totalPrice?: number
  products: DomainReservationProduct[]
}

export interface DomainTransactionTicket {
  ticketId: string
  ticketName?: string
  accessCode?: string
  sessionId?: string
  accessDateTime?: string
  internalCode?: string
}

export interface DomainTransactionProduct {
  productId: string
  productName?: string
  accessCode?: string
  providerId?: string
  providerName?: string
  price?: number
  status?: number
  tickets?: DomainTransactionTicket[]
}

export interface DomainTransaction {
  saleId?: string
  transactionId?: string
  accessDateTime?: string
  transactionDateTime?: string
  totalPrice?: number
  paymentStatus?: number
  products: DomainTransactionProduct[]
}

export interface DomainTransactionList extends DomainBase {
  transactions: DomainTransaction[]
  pageNumber?: number
  pageSize?: number
  totalItemCount?: number
  pageCount?: number
}

export interface DomainDocument {
  url: string
  languageCode?: string
}

export interface DomainDocuments extends DomainBase {
  documents: DomainDocument[]
}

export interface DomainAccessCode {
  id: string
  products: {
    id: string
    tickets: { id: string; accessCode?: string; internalCode?: string }[]
  }[]
}

export interface DomainAccessCodes extends DomainBase {
  transactions: DomainAccessCode[]
}

export interface DomainCancellationRequest {
  id: string
  saleId?: string
  createdDateTime?: string
  status?: number
  statusComments?: string
}

export interface DomainCancellations extends DomainBase {
  requests: DomainCancellationRequest[]
}

export interface DomainLastUpdated extends DomainBase {
  lastUpdatedDateTime?: string
}

// ── Adapter Functions ─────────────────────────────────────────────

/**
 * Normalizes a CatalogResponse.
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
 */
export function adaptLastUpdated(raw: LastUpdatedResponse): DomainLastUpdated {
  return {
    success: raw.Success,
    timestamp: raw.Timestamp,
    errorMessage: raw.ErrorMessage ?? undefined,
    lastUpdatedDateTime: raw.LastUpdatedDateTime,
  }
}
