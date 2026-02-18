// ── Experticket API Types ──────────────────────────────────────────

// Base response shape shared by all Experticket responses
export interface ExperticketBaseResponse {
  Success: boolean
  Timestamp?: string
  ErrorMessage?: string | null
  ErrorCodes?: string[]
  ErrorEntityBreakDown?: { Id: string; Name: string }[]
}

// ── Catalog ───────────────────────────────────────────────────────

export interface CatalogTicket {
  TicketId: string
  TicketName?: string
  IsQuotaTicket?: boolean
  TicketEnclosureId?: string
  TicketEnclosureName?: string
  TicketQuestionsProfileId?: string
  [key: string]: unknown
}

export interface CatalogSession {
  SessionId: string
  SessionTime?: string
  SessionContentName?: string
  HasLimitedCapacity?: boolean
  [key: string]: unknown
}

export interface CatalogProduct {
  ProductId: string
  ProductName?: string
  ProductDescription?: string
  Price?: number
  PriceMode?: number
  AccessDateCriteria?: number
  DaysWithLimitedCapacity?: string[]
  SalesDocumentSettings?: unknown
  Tickets?: CatalogTicket[]
  Sessions?: CatalogSession[]
  ProductPaxGroupingId?: string
  [key: string]: unknown
}

export interface CatalogProductBase {
  ProductBaseId: string
  ProductBaseName?: string
  ProductBaseDescription?: string
  DaysWithLimitedCapacity?: string[]
  Products?: CatalogProduct[]
  [key: string]: unknown
}

export interface CatalogProvider {
  ProviderId: string
  ProviderName?: string
  ProviderDescription?: string
  ProviderCommercialName?: string
  ProviderAccessConditions?: string
  ProviderType?: number
  Logo?: string
  Tags?: string[]
  ProductBases?: CatalogProductBase[]
  CombinedProducts?: unknown[]
  [key: string]: unknown
}

export interface CatalogResponse extends ExperticketBaseResponse {
  Providers?: CatalogProvider[]
  CatalogLastUpdatedDateTime?: string
}

// ── Languages ─────────────────────────────────────────────────────

export interface Language {
  Code: string
  EnglishName: string
  NativeName: string
}

export interface LanguagesResponse extends ExperticketBaseResponse {
  Languages?: Language[]
}

// ── Tags ──────────────────────────────────────────────────────────

export interface Tag {
  Id: string
  Key: number
  Name: string
  PathName: string
  Children: Tag[]
}

export interface TagsResponse extends ExperticketBaseResponse {
  Tags?: Tag[]
}

// ── Last Updated ──────────────────────────────────────────────────

export interface LastUpdatedResponse extends ExperticketBaseResponse {
  LastUpdatedDateTime?: string
}

// ── Available Capacity ────────────────────────────────────────────

export interface CapacityItem {
  ProductBaseId?: string
  ProductId?: string
  SessionId?: string
  Date: string
  AvailableCapacity?: number
  Price?: number
  PriceMode?: number
}

export interface AvailableCapacityResponse extends ExperticketBaseResponse {
  ProductBases?: CapacityItem[]
  Products?: CapacityItem[]
  Sessions?: CapacityItem[]
}

// ── Real-Time Prices ──────────────────────────────────────────────

export interface RealTimePriceItem {
  ProductId: string
  Date?: string
  AccessDate?: string
  Price: number
  PriceMode?: number
  CombinedProductId?: string
  Success?: boolean
  ErrorMessage?: string
}

export interface RealTimePricesResponse extends ExperticketBaseResponse {
  ProductsRealTimePrices?: RealTimePriceItem[]
}

// ── Ticket Questions ──────────────────────────────────────────────

export interface TicketQuestionValue {
  Id?: string
  Value?: string
}

export interface TicketQuestion {
  Id: string
  Question: string
  ShortQuestion?: string
  Required?: boolean
  DataType?: string
  Values?: TicketQuestionValue[]
}

export interface TicketQuestionsProfile {
  Id: string
  Questions?: TicketQuestion[]
}

export interface TicketQuestionsTicket {
  TicketId: string
  TicketQuestionsProfileId?: string
}

export interface TicketQuestionsProduct {
  ProductId: string
  Tickets?: TicketQuestionsTicket[]
}

export interface TicketQuestionsResponse extends ExperticketBaseResponse {
  Products?: TicketQuestionsProduct[]
  TicketQuestionsProfiles?: TicketQuestionsProfile[]
}

// ── Reservation ───────────────────────────────────────────────────

export interface ReservationProductRequest {
  ProductId: string
  Quantity: number
  CombinedProductId?: string | null
  Tickets?: {
    TicketId: string
    SessionId?: string
    AccessDateTime?: string
    Questions?: {
      TicketQuestionId: string
      StringValue?: string
      BooleanValue?: boolean
      DateTimeValue?: string
      IntegerValue?: number
      DecimalValue?: number
    }[]
  }[] | null
  AccessDateTime?: string | null
  AccessEndDateTime?: string | null
}

export interface ReservationRequest {
  ApiKey?: string
  IsTest?: boolean
  AccessDateTime: string
  AccessEndDateTime?: string
  Products: ReservationProductRequest[]
  LanguageCode?: string | null
}

export interface ReservationProductResponse {
  ProductId: string
  Quantity: number
  Price?: number
  PriceMode?: number
  Success: boolean
  ErrorMessage?: string
  Tickets?: { TicketId: string; SessionId?: string; AccessDateTime?: string }[]
  CancellationConditions?: unknown
}

export interface ReservationResponse extends ExperticketBaseResponse {
  ReservationId?: string
  MinutesToExpiry?: number
  AccessDateTime?: string
  AccessEndDateTime?: string
  TotalPrice?: number
  Products?: ReservationProductResponse[]
}

// ── Transaction ───────────────────────────────────────────────────

export interface TransactionCreateRequest {
  ApiKey?: string
  IsTest?: boolean
  ReservationId: string
  AccessDateTime: string
  Products: { ProductId: string }[]
}

export interface TransactionTicket {
  TicketId: string
  TicketName?: string
  AccessCode?: string
  BillingCode?: string
  SessionId?: string
  AccessDateTime?: string
  AccessEndDateTime?: string
  InternalCode?: string
  TicketEnclosureId?: string
  TicketEnclosureName?: string
  SuggestedAccessDateMessage?: string
}

export interface TransactionProduct {
  ProductId: string
  ProductName?: string
  AccessCode?: string
  ProviderId?: string
  ProviderName?: string
  ProviderType?: number
  Price?: number
  RetailPrice?: number
  PriceWithoutVat?: number
  PriceMode?: number
  Status?: number
  CombinedProductId?: string
  Tickets?: TransactionTicket[]
  CancellationConditions?: unknown
}

export interface Transaction {
  SaleId?: string
  TransactionId?: string
  AccessDateTime?: string
  TransactionDateTime?: string
  CancelledDateTime?: string | null
  TotalPrice?: number
  TotalRetailPrice?: number
  TotalPriceWithoutVat?: number
  PaymentStatus?: number
  Products?: TransactionProduct[]
  Client?: Record<string, unknown>
  CombinedProducts?: unknown[]
  [key: string]: unknown
}

export interface TransactionListResponse extends ExperticketBaseResponse {
  Transactions?: Transaction[]
  PageNumber?: number
  PageSize?: number
  TotalItemCount?: number
  PageCount?: number
  HasPreviousPage?: boolean
  HasNextPage?: boolean
  IsFirstPage?: boolean
  IsLastPage?: boolean
  FirstItemOnPage?: number
  LastItemOnPage?: number
}

// ── Transaction Documents ─────────────────────────────────────────

export interface TransactionDocument {
  SalesDocumentUrl: string
  LanguageCode?: string
}

export interface TransactionDocumentsResponse extends ExperticketBaseResponse {
  Documents?: TransactionDocument[]
}

// ── Access Codes ──────────────────────────────────────────────────

export interface AccessCodeTicket {
  Id: string
  AccessCode?: string
  DeliveryState?: number
  InternalCode?: string
}

export interface AccessCodeProduct {
  Id: string
  Tickets?: AccessCodeTicket[]
}

export interface AccessCodeTransaction {
  Id: string
  Products?: AccessCodeProduct[]
}

export interface AccessCodesResponse extends ExperticketBaseResponse {
  Transactions?: AccessCodeTransaction[]
}

// ── Cancellation ──────────────────────────────────────────────────

export interface CancellationRequest {
  ApiKey?: string
  IsTest?: boolean
  SaleId: string
  Reason: number
  ReasonComments?: string
}

export interface CancellationRequestResponse extends ExperticketBaseResponse {
  CancellationRequestId?: string
}

export interface CancellationRequestItem {
  CancellationRequestId: string
  SaleId?: string
  PartnerSaleId?: string
  CreatedDateTime?: string
  UpdatedDateTime?: string
  Status?: number
  StatusComments?: string
}

export interface CancellationListResponse extends ExperticketBaseResponse {
  CancellationRequests?: CancellationRequestItem[]
  PageNumber?: number
  PageSize?: number
  HasPreviousPage?: boolean
  HasNextPage?: boolean
  IsFirstPage?: boolean
}
