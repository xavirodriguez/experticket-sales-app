# 📚 Documentación Técnica Extensa: Experticket Sales Manager

---

## 1. Visión General del Proyecto

**Experticket Sales Manager** es una aplicación web moderna de gestión de ventas de tickets que actúa como interfaz de usuario para la API externa de Experticket. Su propósito es proporcionar a los operadores un flujo completo de venta de entradas: desde la consulta del catálogo hasta la emisión de tickets con códigos de acceso, gestión de cancelaciones y descarga de documentos.

El nombre de la app y su descripción están definidos en el root layout: [1](#0-0) 

La página raíz (`/`) redirige automáticamente a `/sale` para acceso inmediato al flujo principal: [2](#0-1) 

---

## 2. Arquitectura General del Sistema

El proyecto sigue una **arquitectura de tres capas** con un patrón **BFF (Backend-for-Frontend)**:

```mermaid
graph TD
    "Navegador (React 19)" --> "Next.js App Router"
    "Next.js App Router" --> "API Route Handlers (/api/experticket/*)"
    "API Route Handlers (/api/experticket/*)" --> "Experticket External API"
    "Next.js App Router" --> "React Components (Client)"
    "React Components (Client)" --> "Navegador (React 19)"
    "lib/experticket/server-client.ts" --> "API Route Handlers (/api/experticket/*)"
    "lib/experticket/service.ts" --> "lib/experticket/server-client.ts"
    "lib/experticket/adapter.ts" --> "lib/experticket/service.ts"
    "lib/experticket/schema.ts (Zod)" --> "lib/experticket/service.ts"
```

### 2.1 Capa de Cliente (Frontend)
- Componentes React 19 con TypeScript
- SWR para data fetching del lado del cliente
- Validación con React Hook Form + Zod
- Primitivos accesibles de Radix UI

### 2.2 Capa de Servidor (BFF)
- Next.js App Router actúa como proxy seguro
- **Nunca** se exponen las credenciales al navegador
- Variables de entorno leídas exclusivamente en el servidor

Las credenciales del servidor se leen exclusivamente de variables de entorno: [3](#0-2) 

### 2.3 Capa de Integración (`lib/experticket/`)
La librería de integración sigue el patrón **Adapter-Service-Handler**:

```mermaid
graph LR
    "Route Handler" --> "ExperticketService"
    "ExperticketService" --> "experticketFetch"
    "experticketFetch" --> "API Externa"
    "API Externa" --> "Respuesta Raw (PascalCase)"
    "Respuesta Raw (PascalCase)" --> "Schema Zod (validación)"
    "Schema Zod (validación)" --> "Adapter (camelCase)"
    "Adapter (camelCase)" --> "Domain Model"
```

---

## 3. Estructura de Directorios Detallada

```
experticket-sales-app/
├── app/
│   ├── (dashboard)/           # Grupo de rutas autenticadas con layout compartido
│   │   ├── sale/              # Wizard de venta multi-paso (6 pasos)
│   │   ├── transactions/      # Búsqueda y detalles de transacciones
│   │   ├── documents/         # Descarga de documentos PDF
│   │   ├── codes/             # Consulta de códigos de acceso
│   │   ├── cancellations/     # Gestión de cancelaciones
│   │   ├── config/            # Configuración y conexión
│   │   └── layout.tsx         # Envuelve todo con AppShell
│   ├── api/
│   │   └── experticket/       # Proxy hacia la API externa
│   ├── layout.tsx             # Root layout (metadata, MSW, Analytics)
│   └── page.tsx               # Redirige a /sale
├── components/
│   ├── ui/                    # Componentes Radix/shadcn
│   ├── experticket/           # Componentes compartidos del dominio
│   └── app-shell.tsx          # Navegación principal
├── lib/
│   └── experticket/
│       ├── types.ts           # Tipos TypeScript de la API externa (PascalCase)
│       ├── schema.ts          # Schemas Zod de validación
│       ├── adapter.ts         # Normalización PascalCase → camelCase (Domain Models)
│       ├── service.ts         # Lógica de orquestación (ExperticketService)
│       ├── server-client.ts   # Cliente HTTP del servidor
│       ├── client.ts          # Helpers del cliente (fetcher SWR)
│       ├── tools.ts           # Herramientas para agente IA
│       ├── storage.ts         # Abstracción de localStorage
│       ├── api-utils.ts       # Utilidades para Route Handlers
│       ├── constants.ts       # Constantes centralizadas
│       ├── utils.ts           # Funciones de utilidad compartidas
│       └── index.ts           # Barrel export
├── mocks/
│   ├── handlers/              # Handlers MSW por dominio
│   ├── fixtures/              # Datos de prueba estáticos
│   ├── server.ts              # MSW server (Node.js)
│   └── browser.ts             # MSW browser (ServiceWorker)
└── instrumentation.ts         # Inicialización de MSW en servidor
```

---

## 4. El Cliente HTTP del Servidor: `server-client.ts`

Este es el núcleo de la integración. La función `experticketFetch` es la única manera en que la aplicación habla con la API externa de Experticket.

### 4.1 Funcionamiento Interno

La función principal `experticketFetch` orquesta: [4](#0-3) 

Internamente construye la URL con parámetros, incluyendo credenciales automáticas para GET requests: [5](#0-4) 

### 4.2 Gestión de Caché Next.js

Los GET requests tienen revalidación por defecto de 60 segundos, mientras que POST/DELETE usan `no-store`: [6](#0-5) 

### 4.3 Sistema de Timeouts y Reintentos

Utiliza un `AbortController` para manejar timeouts: [7](#0-6) 

Los reintentos usan **backoff exponencial** y solo aplican a GET (idempotentes): [8](#0-7) 

Las constantes de timeout y reintentos por defecto son: [9](#0-8) 

### 4.4 Manejo de Errores Tipados

Se usa la clase `ExperticketError` para encapsular errores con status HTTP y detalles del upstream: [10](#0-9) 

---

## 5. La Capa de Servicio: `ExperticketService`

La clase `ExperticketService` es el **orquestador central** que combina fetch → validación Zod → adaptación. Se expone como **singleton**: [11](#0-10) 

### Métodos principales:

| Método | Endpoint Externo | Descripción |
|---|---|---|
| `getCatalog()` | `GET /catalog` | Catálogo completo de proveedores y productos |
| `getProviders()` | `GET /providers` | Lista simplificada de proveedores |
| `getLanguages()` | `GET /AvailableLanguages` | Idiomas del sistema |
| `getCapacity()` | `GET /availablecapacity` | Disponibilidad por fecha |
| `getRealTimePrices()` | `POST /RealTimePrices` | Precios en tiempo real |
| `checkTicketQuestions()` | `POST /checkticketsquestions` | Preguntas obligatorias |
| `createReservation()` | `POST /reservation` | Crea reserva temporal |
| `deleteReservation()` | `DELETE /reservation` | Cancela reserva |
| `createTransaction()` | `POST /transaction` | Finaliza la venta |
| `listTransactions()` | `GET /transaction` | Lista transacciones |
| `getDocuments()` | `GET /transactiondocuments` | URLs de PDFs |
| `getAccessCodes()` | `GET /transactionaccesscodes` | Códigos de acceso/QR |
| `createCancellation()` | `POST /cancellationrequest` | Solicita cancelación |
| `listCancellations()` | `GET /cancellationrequest` | Lista cancelaciones |
| `checkCancellationEligibility()` | (composición) | Verifica si es cancelable |

La comprobación de elegibilidad de cancelación es un método compuesto que combina `listTransactions` + lógica de dominio: [12](#0-11) 

El singleton se exporta para ser usado por todos los Route Handlers: [13](#0-12) 

---

## 6. La Capa de Validación: `schema.ts` (Zod)

Cada respuesta de la API externa pasa por validación Zod **antes** de ser adaptada. El schema base compartido por todas las respuestas: [14](#0-13) 

Los schemas usan `z.record(z.unknown()).and(...)` para el catálogo, permitiendo campos adicionales desconocidos de la API: [15](#0-14) 

Los tags usan un schema **recursivo** con `z.lazy()` para representar la jerarquía: [16](#0-15) 

---

## 7. La Capa de Adaptación: `adapter.ts`

El adaptador convierte los modelos con **PascalCase** de la API externa a **camelCase** del dominio interno. Esta es la normalización clave del proyecto.

### Jerarquía de modelos de dominio:

```
DomainCatalog
└── DomainProvider
    └── DomainProductBase
        └── DomainProduct
            ├── DomainTicket
            └── DomainSession

DomainReservation
└── DomainReservationProduct
    ├── DomainReservationTicket
    └── DomainCancellationConditions

DomainTransaction
└── DomainTransactionProduct
    ├── DomainTransactionTicket
    └── DomainCancellationConditions

DomainAccessCodes
└── DomainAccessCode (transaction level)
    └── DomainAccessCodeProduct
        └── DomainAccessCodeTicket
```

La función adaptadora raíz del catálogo: [17](#0-16) 

Los `DomainProduct` incluyen un flag adicional no presente en la API: `requiresRealTimePrice`, que se computa desde el campo `RequiresRealTimePrice`: [18](#0-17) 

---

## 8. Los API Route Handlers (Proxy BFF)

Cada endpoint en `app/api/experticket/` es un **proxy transparente** hacia la API de Experticket. Inyectan credenciales y manejan errores de forma estandarizada.

### 8.1 Catálogo [19](#0-18) 

### 8.2 Transacciones (GET + POST)
El GET soporta múltiples filtros de búsqueda: [20](#0-19) 

### 8.3 Cancelaciones (lógica dual)
El POST maneja dos acciones: `check` (consulta) y `create` (cancelación real): [21](#0-20) 

### 8.4 Utilidades de Route Handlers
Se usa `createErrorResponse` para estandarizar todas las respuestas de error, diferenciando `ExperticketError` de errores genéricos: [22](#0-21) 

---

## 9. El Wizard de Venta: Flujo Multi-Paso (6 pasos)

Este es el flujo principal de la aplicación. El estado centralizado se maneja con el hook `useSaleWizard`.

### 9.1 Definición del estado compartido

El `SaleState` acumula datos a lo largo de los 6 pasos: [23](#0-22) 

Los pasos están definidos como constante tipada: [24](#0-23) 

### 9.2 El hook `useSaleWizard`

Gestiona navegación con soporte para **pasos omisibles** (`skippedSteps`): [25](#0-24) 

### 9.3 Limpieza automática de reservas

El hook implementa un mecanismo de limpieza: si el usuario abandona el wizard con una reserva activa pero **sin transacción completada**, se cancela la reserva automáticamente: [26](#0-25) 

### 9.4 La página principal del wizard

Renderiza el componente de paso correcto según el estado e incluye un indicador de progreso navegable: [27](#0-26) 

### 9.5 Flujo completo paso a paso

```mermaid
graph LR
    "Paso 0: Selection" --> "Paso 1: Capacity"
    "Paso 1: Capacity" --> "Paso 2: Pricing"
    "Paso 2: Pricing" --> "Paso 3: Questions"
    "Paso 3: Questions" --> "Paso 4: Reservation"
    "Paso 4: Reservation" --> "Paso 5: Transaction"
    "Paso 5: Transaction" --> "Reset o nueva venta"
```

**Paso 0 - Selection:** El usuario selecciona idioma, fecha de acceso, proveedor y añade productos al carrito: [28](#0-27) 

**Paso 4 - Reservation:** Crea la reserva temporal (bloqueo de inventario). Si expira, no se puede avanzar: [29](#0-28) 

---

## 10. Tipos de la API Externa: `types.ts`

El proyecto define tipos TypeScript completos para toda la API. La base es: [30](#0-29) 

### Jerarquía del catálogo (PascalCase, API): [31](#0-30) 

### Ciclo de vida de la transacción:

**Reserva** (estado temporal): [32](#0-31) 

**Transacción** (estado definitivo): [33](#0-32) 

---

## 11. Gestión de Transacciones

La página de transacciones utiliza SWR para buscar de forma reactiva por SaleId: [34](#0-33) 

La función `normalizeApiResponse` garantiza que la respuesta —independientemente de su formato— siempre produzca un array de entidades: [35](#0-34) 

---

## 12. Página de Configuración

La página de configuración permite:

1. **Verificar la conexión** vía el endpoint `lastupdated`
2. **Activar Test Mode** (persistido en `localStorage`)
3. **Sobreescribir configuración** por sesión (Advanced Mode)

El Test Mode se persiste en `localStorage` con clave `experticket_is_test`: [36](#0-35) 

La verificación de conexión llama al endpoint interno `/api/experticket/lastupdated`: [37](#0-36) 

La abstracción de `localStorage` es segura para SSR: [38](#0-37) 

---

## 13. Sistema de Mocking (MSW)

El proyecto implementa una capa completa de mocking con **Mock Service Worker (MSW)** para desarrollo y pruebas sin costes reales.

### 13.1 Activación

Controlado por la variable de entorno `NEXT_PUBLIC_API_MOCKING=enabled`.

**Server-side** (Node.js runtime): Se inicializa en `instrumentation.ts`: [39](#0-38) 

**Client-side** (Browser): El `MswProvider` en el root layout inicializa el Service Worker: [40](#0-39) 

### 13.2 Estructura de handlers

Los handlers están organizados por dominio y se combinan en un array central: [41](#0-40) 

El servidor MSW para tests de Node: [42](#0-41) 

---

## 14. Herramientas de IA Agéntica: `tools.ts`

El módulo `tools.ts` expone funciones diseñadas para ser usadas por un agente LLM. Actúan como una API semántica sobre el servicio: [43](#0-42) 

Las operaciones **sensibles** están marcadas con comentarios de "HITL" (Human-in-the-loop): [44](#0-43) 

---

## 15. Navegación: `AppShell`

El `AppShell` implementa una barra de navegación sticky con soporte responsive. En móvil usa un drawer colapsable: [45](#0-44) 

Los items de navegación configurados: [46](#0-45) 

El layout del dashboard envuelve todas las rutas con `AppShell`: [47](#0-46) 

---

## 16. Stack Tecnológico Completo

Las dependencias principales del proyecto: [48](#0-47) 

Los scripts disponibles: [49](#0-48) 

---

## 17. Modelo de Dominio de Negocio (Jerarquía Experticket)

Según el informe técnico incluido en el proyecto, el modelo de negocio sigue una jerarquía estricta: [50](#0-49) 

### El ciclo de vida completo de una transacción: [51](#0-50) 

### Enums críticos: [52](#0-51) 

---

## 18. Endpoints de la API Externa (Inventario Completo)

La tabla completa de endpoints mapeados en el proyecto: [53](#0-52) 

---

## 19. Seguridad y Gestión de Secretos

La estrategia de seguridad implementada: [54](#0-53) 

Los parámetros de query URL incluyen automáticamente credenciales **solo en el servidor**: [55](#0-54) 

---

## 20. Observabilidad y Errores

El proyecto integra **Vercel Analytics** para monitoring de producción: [56](#0-55) 

La matriz de errores y su manejo recomendado: [57](#0-56) 

---

## 21. Utilidades Clave

### `formatPrice` - Formateo de precios [58](#0-57) 

### `resolveTransactionId` - Resolución de IDs inconsistentes [59](#0-58) 

### Constantes globales: [60](#0-59) 

---

## Notes

1. **Patrón BFF**: Toda comunicación con la API de Experticket pasa exclusivamente por los Route Handlers de Next.js. **Nunca** se llama a la API externa desde el browser directamente. Esto mantiene las credenciales seguras.

2. **Tres representaciones de datos**: El proyecto maneja tres capas de tipos: (a) `types.ts` PascalCase = API externa, (b) Schemas Zod = validación runtime, (c) `adapter.ts` camelCase = dominio interno. Esta separación protege al frontend de cambios en la API.

3. **Reservas con expiración**: El wizard implementa limpieza automática de reservas al desmontar el componente, evitando reservas "fantasma" bloqueando inventario en la API de Experticket.

4. **Pasos omisibles**: El wizard soporta `skippedSteps` (un `Set<number>`), lo que permite que ciertos pasos (como `Questions` si no hay preguntas obligatorias) sean saltados dinámicamente.

5. **Modo Test**: El flag `IsTest=true` se almacena en `localStorage` bajo la clave `experticket_is_test` y debe ser leído e inyectado en las peticiones de reserva y transacción para evitar operaciones reales durante pruebas.

6. **MSW Dual**: El proyecto implementa MSW tanto en el servidor Node.js (`instrumentation.ts`) como en el browser (`MswProvider`), cubriendo el 100% del flujo de datos sin necesidad de un servidor real de Experticket durante desarrollo.

### Citations

**File:** app/layout.tsx (L1-28)
```typescript
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { MswProvider } from "@/components/experticket/msw-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Experticket Sales Manager",
  description: "Manage Experticket ticketing sales, transactions, and cancellations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <MswProvider>
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
        </MswProvider>
      </body>
    </html>
  )
}
```

**File:** app/page.tsx (L1-5)
```typescript
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/sale")
}
```

**File:** lib/experticket/server-client.ts (L13-17)
```typescript
const BASE_URL = process.env.EXPERTICKET_BASE_URL || "https://api.experticket.com"
const PARTNER_ID = process.env.EXPERTICKET_PARTNER_ID || ""
const API_KEY = process.env.EXPERTICKET_API_KEY || ""
const API_VERSION = process.env.EXPERTICKET_API_VERSION || "3.58"
const DEFAULT_LANG = process.env.EXPERTICKET_DEFAULT_LANGUAGE || "en"
```

**File:** lib/experticket/server-client.ts (L22-42)
```typescript
export class ExperticketError extends Error {
  /** HTTP status code from the upstream response. */
  public readonly status: number
  /** Raw response body or additional error details. */
  public readonly details?: string

  /**
   * Initializes a new instance of the {@link ExperticketError} class.
   *
   * @param message - Error message.
   * @param status - HTTP status code.
   * @param details - Raw response body or additional details.
   */
  constructor(message: string, status: number, details?: string) {
    super(message)
    this.name = "ExperticketError"
    this.status = status
    this.details = details
    Object.setPrototypeOf(this, ExperticketError.prototype)
  }
}
```

**File:** lib/experticket/server-client.ts (L141-157)
```typescript
export async function experticketFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const method = options.method || "GET"
  const url = buildRequestUrl(path, options.params || {}, method)
  const fetchOptions = prepareFetchOptions(options)
  const timeout = options.timeout ?? DEFAULT_FETCH_TIMEOUT
  const retries = options.retries ?? DEFAULT_FETCH_RETRIES

  return await executeRequestWithTimeout<T>({
    url: url.toString(),
    options: fetchOptions,
    timeout,
    retries,
  })
}
```

**File:** lib/experticket/server-client.ts (L199-230)
```typescript
function buildRequestUrl(path: string, params: Record<string, unknown>, method: string): URL {
  const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path
  const url = new URL(`${normalizedBase}/${normalizedPath}`)

  const mergedParams = mergeDefaultParams(params)
  const allParams = applyCredentials(mergedParams, method)

  appendUrlSearchParams(url, allParams)

  return url
}

/**
 * Appends credentials to query string for GET requests if not provided.
 *
 * @internal
 */
function applyCredentials(params: Record<string, unknown>, method: string): Record<string, unknown> {
  const allParams = { ...params }

  if (method === "GET") {
    if (!allParams.PartnerId && PARTNER_ID) {
      allParams.PartnerId = PARTNER_ID
    }
    if (!allParams.ApiKey && API_KEY) {
      allParams.ApiKey = API_KEY
    }
  }

  return allParams
}
```

**File:** lib/experticket/server-client.ts (L294-300)
```typescript
function applyCachingStrategy(options: NextFetchRequestInit, method: string, revalidate: number) {
  if (method === "GET") {
    options.next = { revalidate }
  } else {
    options.cache = "no-store"
  }
}
```

**File:** lib/experticket/server-client.ts (L327-342)
```typescript
async function executeRequestWithTimeout<T>({
  url,
  options,
  timeout,
  retries,
}: ExecuteRequestOptions): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const optionsWithSignal = { ...options, signal: controller.signal }
    return await performFetchWithRetry<T>({ url, options: optionsWithSignal, retries })
  } finally {
    clearTimeout(timer)
  }
}
```

**File:** lib/experticket/server-client.ts (L352-383)
```typescript
async function performFetchWithRetry<T>({
  url,
  options,
  retries,
}: RetryOptions): Promise<T> {
  const maxAttempts = options.method === "GET" ? 1 + retries : 1

  return await executeAttempts<T>(url, options, maxAttempts)
}

/**
 * Recursively executes fetch attempts until success or max attempts reached.
 *
 * @internal
 */
async function executeAttempts<T>(
  url: string,
  options: NextFetchRequestInit,
  maxAttempts: number,
  currentAttempt: number = 1
): Promise<T> {
  try {
    const response = await fetch(url, options)
    return await handleApiResponse<T>(response)
  } catch (error) {
    if (currentAttempt >= maxAttempts) {
      throw error
    }
    await delay(500 * currentAttempt)
    return await executeAttempts<T>(url, options, maxAttempts, currentAttempt + 1)
  }
}
```

**File:** lib/experticket/constants.ts (L1-44)
```typescript
/**
 * Centralized constants for the Experticket integration.
 *
 * @remarks
 * This module contains configuration defaults and storage keys used
 * throughout the Experticket integration.
 *
 * @packageDocumentation
 */

/**
 * Default timeout for Experticket API requests in milliseconds.
 * @defaultValue 15000
 */
export const DEFAULT_FETCH_TIMEOUT = 15000

/**
 * Default number of retry attempts for idempotent GET requests.
 * @defaultValue 1
 */
export const DEFAULT_FETCH_RETRIES = 1

/**
 * Default reason code used when initiating a cancellation.
 * @defaultValue 0
 */
export const DEFAULT_CANCELLATION_REASON = 0

/**
 * Default currency code used for price formatting.
 * @defaultValue "EUR"
 */
export const DEFAULT_CURRENCY = "EUR"

/**
 * Centralized keys used for storing application state in localStorage.
 */
export const STORAGE_KEYS = {
  /** Key for storing whether the application is in test mode. */
  IS_TEST_MODE: "experticket_is_test",
} as const


```

**File:** lib/experticket/service.ts (L32-61)
```typescript
export class ExperticketService {
  /**
   * Retrieves the product catalog including providers and products.
   *
   * @param languageCode - Optional ISO language code for localized content.
   * @param filters - Additional search filters.
   * @returns A promise that resolves to the normalized catalog.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails or the response is invalid.
   *
   * @example
   * ```typescript
   * const catalog = await experticketService.getCatalog("en");
   * ```
   */
  async getCatalog(
    languageCode?: string,
    filters: Record<string, string | number | boolean | string[] | undefined> = {}
  ): Promise<adapters.DomainCatalog> {
    const raw = await experticketFetch("catalog", {
      params: {
        PartnerId: getPartnerId(),
        LanguageCode: languageCode || getDefaultLanguage(),
        ...filters,
      },
    })
    const validated = schemas.CatalogResponseSchema.parse(raw)
    return adapters.adaptCatalog(validated)
  }
```

**File:** lib/experticket/service.ts (L395-419)
```typescript
  async checkCancellationEligibility(saleId: string) {
    const txList = await this.listTransactions({ SaleId: saleId })
    const tx = txList.transactions[0]

    if (!tx) {
      throw new Error(`Transaction ${saleId} not found`)
    }

    const isCancellable = tx.products.some((p) => p.cancellationConditions?.isRefundable)
    const amount = tx.products.reduce((acc, p) => acc + (p.price || 0), 0)

    return {
      Success: true,
      IsCancellable: isCancellable,
      Amount: amount,
      Currency: "EUR",
      Message: isCancellable
        ? "This transaction can be cancelled."
        : "This transaction is not eligible for refund.",
      Policies: tx.products.map((p) => ({
        ProductId: p.productId,
        Conditions: p.cancellationConditions,
      })),
    }
  }
```

**File:** lib/experticket/service.ts (L423-425)
```typescript
 * Singleton instance of the ExperticketService.
 */
export const experticketService = new ExperticketService()
```

**File:** lib/experticket/schema.ts (L18-38)
```typescript
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
```

**File:** lib/experticket/schema.ts (L71-96)
```typescript
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
```

**File:** lib/experticket/schema.ts (L165-178)
```typescript
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
```

**File:** lib/experticket/adapter.ts (L593-601)
```typescript
export function adaptCatalog(catalogResponse: CatalogResponse): DomainCatalog {
  return {
    success: catalogResponse.Success,
    timestamp: catalogResponse.Timestamp,
    errorMessage: catalogResponse.ErrorMessage ?? undefined,
    catalogLastUpdatedDateTime: catalogResponse.CatalogLastUpdatedDateTime,
    providers: (catalogResponse.Providers || []).map(adaptProvider),
  }
}
```

**File:** lib/experticket/adapter.ts (L627-640)
```typescript
function adaptProduct(apiProduct: CatalogProduct): DomainProduct {
  return {
    productId: apiProduct.ProductId,
    productName: apiProduct.ProductName,
    productDescription: apiProduct.ProductDescription,
    price: apiProduct.Price,
    priceMode: apiProduct.PriceMode,
    accessDateCriteria: apiProduct.AccessDateCriteria,
    daysWithLimitedCapacity: apiProduct.DaysWithLimitedCapacity,
    tickets: (apiProduct.Tickets || []).map(adaptTicket),
    sessions: (apiProduct.Sessions || []).map(adaptSession),
    requiresRealTimePrice: Boolean(apiProduct.RequiresRealTimePrice),
  }
}
```

**File:** app/api/experticket/catalog/route.ts (L9-25)
```typescript
 * @description API route handler for retrieving the Experticket product catalog.
 */

/**
 * Handles GET requests to retrieve the product catalog.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the catalog.
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const languageCode = (params.LanguageCode as string) || undefined
    const catalogData = await experticketService.getCatalog(languageCode, params)
    return NextResponse.json(catalogData)
  } catch (err: unknown) {
    return createErrorResponse(err)
```

**File:** app/api/experticket/transaction/route.ts (L28-56)
```typescript
/**
 * Handles GET requests to search or list transactions.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the list of transactions.
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const transactionListData = await experticketService.listTransactions(params)
    return NextResponse.json(transactionListData)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}


```

**File:** app/api/experticket/cancellation/route.ts (L9-45)
```typescript
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, saleId, reason, reasonComments, ...rest } = body

    if (action === "check") {
      const data = await experticketService.checkCancellationEligibility(saleId)
      return NextResponse.json(data)
    }

    const data = await experticketService.createCancellation({
      SaleId: saleId,
      Reason: reason ?? 0,
      ReasonComments: reasonComments || undefined,
      ...rest,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Handles GET requests to list cancellation requests.
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const data = await experticketService.listCancellations(params)
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}


```

**File:** lib/experticket/api-utils.ts (L53-73)
```typescript
export function createErrorResponse(
  err: unknown,
  fallbackStatus: number = 502
): NextResponse {
  const isExperticketError = err instanceof ExperticketError
  const message = err instanceof Error ? err.message : "Unknown error"
  const upstreamStatus = isExperticketError ? err.status : fallbackStatus
  const details = isExperticketError ? err.details : undefined

  logErrorInDevelopment(message, upstreamStatus, details)

  return NextResponse.json(
    {
      Success: false,
      ErrorMessage: message,
      UpstreamStatus: upstreamStatus,
      Details: details,
    },
    { status: upstreamStatus }
  )
}
```

**File:** app/(dashboard)/sale/use-sale-wizard.ts (L18-56)
```typescript
export interface SaleState {
  /** ISO 639-1 two-letter language code selected for the sale. */
  language: string
  /** The provider selected in Step 1. */
  provider: DomainProvider | undefined
  /** List of products added to the cart, including their quantities. */
  selectedProducts: (DomainProduct & { quantity: number })[]
  /** Chosen access date for the sale. */
  accessDate: string
  /** Optional end date for venue access in ISO 8601 format. */
  accessEndDate?: string
  /** Optional session identifier if a specific time slot was selected. */
  sessionId?: string

  // Step 2
  /** Capacity data fetched for the selected products and date. */
  capacityData: DomainCapacityItem[]

  // Step 3
  /** Real-time pricing information. */
  pricingData: DomainRealTimePrice[]

  // Step 4
  /** Answers provided for the required ticket questions, keyed by question ID. */
  questionAnswers: Record<string, unknown>

  // Step 5
  /** The reservation result from the Experticket API. */
  reservation: DomainReservation | undefined
  /** Timestamp indicating when the current reservation expires. */
  reservationExpiry: number | undefined

  // Step 6
  /** The final transaction details after successful creation. */
  transaction: DomainTransaction | undefined

  /** Steps that should be skipped based on current selection. */
  skippedSteps: Set<number>
}
```

**File:** app/(dashboard)/sale/use-sale-wizard.ts (L61-68)
```typescript
export const STEPS = [
  "Selection",
  "Capacity",
  "Pricing",
  "Questions",
  "Reservation",
  "Transaction",
] as const
```

**File:** app/(dashboard)/sale/use-sale-wizard.ts (L83-133)
```typescript
export function useSaleWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<SaleState>(createInitialState())

  /**
   * Updates the wizard state with a partial state object.
   */
  const updateState = useCallback(
    (partial: Partial<SaleState>) => setState((prev) => ({ ...prev, ...partial })),
    []
  )

  /**
   * Advances to the next step in the wizard, skipping those that aren't needed.
   */
  const goNext = useCallback(() => {
    setStep((current) => {
      let next = current + 1
      while (next < STEPS.length - 1 && state.skippedSteps.has(next)) {
        next++
      }
      return Math.min(next, STEPS.length - 1)
    })
  }, [state.skippedSteps])

  /**
   * Navigates back to the previous step in the wizard, skipping那些 marked as skipped.
   */
  const goBack = useCallback(() => {
    setStep((current) => {
      let prev = current - 1
      while (prev > 0 && state.skippedSteps.has(prev)) {
        prev--
      }
      return Math.max(prev, 0)
    })
  }, [state.skippedSteps])

  /**
   * Navigates to a specific step by its index.
   * @param idx - The zero-based index of the target step.
   */
  const goTo = useCallback((idx: number) => setStep(idx), [])

  /**
   * Resets the entire sale wizard to its initial state and step.
   */
  const resetSale = useCallback(() => {
    setState(createInitialState())
    setStep(0)
  }, [])
```

**File:** app/(dashboard)/sale/use-sale-wizard.ts (L136-156)
```typescript
  const lastReservationId = useRef<string | undefined>(undefined)

  useEffect(() => {
    lastReservationId.current = state.reservation?.reservationId
  }, [state.reservation?.reservationId])

  useEffect(() => {
    return () => {
      const resId = lastReservationId.current
      // Only delete if we have a reservation but NO transaction was completed
      if (resId && !state.transaction) {
        fetch("/api/experticket/reservation", {
          method: "DELETE",
          body: JSON.stringify({ ReservationId: resId }),
          headers: { "Content-Type": "application/json" },
        }).catch(() => {
          // Silent catch for cleanup on unmount
        })
      }
    }
  }, [state.transaction])
```

**File:** app/(dashboard)/sale/page.tsx (L26-90)
```typescript
export default function SalePage() {
  const { step, state, updateState, goNext, goBack, goTo, resetSale } = useSaleWizard()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">New Sale</h1>
        <p className="text-muted-foreground">
          Follow the steps to create a new sale.
        </p>
      </div>

      {/* Step indicator */}
      <nav aria-label="Sale steps" className="flex flex-wrap items-center gap-2">
        {STEPS.reduce((acc, label, idx) => {
          const isSkipped = state.skippedSteps.has(idx)
          if (isSkipped) return acc

          const displayIdx = acc.length + 1
          acc.push(
            <button
              key={label}
              onClick={() => idx < step && goTo(idx)}
              disabled={idx > step}
              className="flex items-center gap-1.5"
            >
              <Badge
                variant={idx === step ? "default" : idx < step ? "secondary" : "outline"}
                className={cn(
                  "cursor-pointer text-xs transition-colors",
                  idx > step && "opacity-50 cursor-not-allowed"
                )}
              >
                {displayIdx}. {label}
              </Badge>
            </button>
          )
          return acc
        }, [] as React.ReactNode[])}
      </nav>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 0 && (
          <StepSelection state={state} updateState={updateState} onNext={goNext} />
        )}
        {step === 1 && (
          <StepCapacity state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 2 && (
          <StepPricing state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 3 && (
          <StepQuestions state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 4 && (
          <StepReservation state={state} updateState={updateState} onNext={goNext} onBack={goBack} />
        )}
        {step === 5 && (
          <StepTransaction state={state} onReset={resetSale} />
        )}
      </div>
    </div>
  )
}
```

**File:** app/(dashboard)/sale/step-selection.tsx (L33-88)
```typescript
export function StepSelection({ state, updateState, onNext }: Props) {
  const {
    language,
    setLanguage,
    accessDate,
    setAccessDate,
    selectedProvider,
    setSelectedProvider,
    cart,
    addToCart,
    removeFromCart,
    languages,
    providers,
    catalogLoading,
    handleNext,
  } = useSelectionState(state, updateState, onNext)

  return (
    <div className="space-y-6">
      <LanguageAndDateSelector
        language={language}
        onLanguageChange={setLanguage}
        accessDate={accessDate}
        onDateChange={setAccessDate}
        languages={languages}
      />

      <ProviderSelector
        providers={providers}
        isLoading={catalogLoading}
        selectedProvider={selectedProvider}
        onSelect={setSelectedProvider}
      />

      {selectedProvider && (
        <ProductList
          provider={selectedProvider}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}

      {cart.length > 0 && <CartSummary cart={cart} />}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedProvider || cart.length === 0 || !accessDate}
        >
          Next: Check Capacity
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
```

**File:** app/(dashboard)/sale/step-reservation.tsx (L34-91)
```typescript
export function StepReservation({ state, updateState, onNext, onBack }: Props) {
  const {
    reservation,
    loading,
    cancelling,
    error,
    timeLeft,
    isExpired,
    makeReservation,
    cancelReservation,
    resetReservationState,
  } = useReservationState(state, updateState)

  function handleNext() {
    if (!reservation?.reservationId) {
      toast.error("You must create a reservation first")
      return
    }
    if (isExpired) {
      toast.error("Reservation has expired. Please create a new one.")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      {!reservation ? (
        <ReservationSummaryCard
          accessDate={state.accessDate}
          productsCount={state.selectedProducts.length}
          itemsCount={state.selectedProducts.reduce((a, p) => a + p.quantity, 0)}
          loading={loading}
          error={error}
          onAction={makeReservation}
        />
      ) : (
        <ReservationDetailsCard
          reservation={reservation}
          timeLeft={timeLeft}
          isExpired={isExpired}
          isCancelling={cancelling}
          onCancel={cancelReservation}
          onRetry={resetReservationState}
        />
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!reservation || isExpired}>
          Next: Create Transaction
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
```

**File:** lib/experticket/types.ts (L16-32)
```typescript
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
```

**File:** lib/experticket/types.ts (L128-162)
```typescript
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
```

**File:** lib/experticket/types.ts (L539-552)
```typescript
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
```

**File:** lib/experticket/types.ts (L640-667)
```typescript
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
```

**File:** app/(dashboard)/transactions/page.tsx (L25-82)
```typescript
export default function TransactionsPage() {
  const [txIdSearch, setTxIdSearch] = useState("")
  const [searchedTxId, setSearchedTxId] = useState<string | undefined>(undefined)
  const [selectedTx, setSelectedTx] = useState<DomainTransaction | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  /**
   * Fetches transaction data when a search ID is provided.
   */
  const { data: txData, isLoading } = useSWR(
    searchedTxId ? `/api/experticket/transaction?SaleId=${encodeURIComponent(searchedTxId)}` : null,
    fetcher
  )

  /**
   * Handles the search action.
   */
  function handleSearch() {
    if (!txIdSearch.trim()) return
    setError(undefined)
    setSelectedTx(undefined)
    setSearchedTxId(txIdSearch.trim())
  }

  /**
   * Normalizes the API response into an array of transactions.
   */
  const transactions = normalizeApiResponse<DomainTransaction>(txData, "transactions")

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Transactions"
        description="Search and manage completed transactions"
      />

      <TransactionSearch
        searchId={txIdSearch}
        onSearchIdChange={setTxIdSearch}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {error && <ErrorAlert message={error} />}

      {selectedTx ? (
        <TransactionDetailsView transaction={selectedTx} onBack={() => setSelectedTx(undefined)} />
      ) : (
        <TransactionResultsTable
          transactions={transactions}
          onSelectTransaction={setSelectedTx}
        />
      )}

      {searchedTxId && !isLoading && transactions.length === 0 && !error && <NoResultsFound />}
    </div>
  )
}
```

**File:** lib/experticket/utils.ts (L29-32)
```typescript
export function resolveTransactionId(transaction: Transaction): string {
  const id = transaction.SaleId ?? transaction.TransactionId ?? transaction.Id
  return id !== undefined && id !== null ? String(id) : "N/A"
}
```

**File:** lib/experticket/utils.ts (L51-65)
```typescript
export function formatPrice(
  amount: number | string | null | undefined,
  currency: string = "EUR"
): string {
  if (amount === undefined || amount === null || amount === "") {
    return "N/A"
  }

  const numericAmount = Number(amount)
  if (isNaN(numericAmount)) {
    return "N/A"
  }

  return `${numericAmount.toFixed(2)} ${currency}`
}
```

**File:** lib/experticket/utils.ts (L84-97)
```typescript
export function normalizeApiResponse<T = Record<string, unknown>>(
  response: unknown,
  listKeys?: string | string[]
): T[] {
  if (Array.isArray(response)) {
    return response as T[]
  }

  if (!isValidObject(response)) {
    return []
  }

  return normalizeFromObject<T>(response as Record<string, unknown>, listKeys)
}
```

**File:** app/(dashboard)/config/page.tsx (L38-65)
```typescript
  async function checkConnection() {
    setChecking(true)
    setConnectionResult(null)
    try {
      const res = await fetch("/api/experticket/lastupdated")
      const data = await res.json()
      if (data.success) {
        setConnectionResult({
          success: true,
          message: "Connection successful",
          timestamp: data.lastUpdatedDateTime || data.timestamp,
        })
        toast.success("Connection to Experticket API is healthy")
      } else {
        setConnectionResult({
          success: false,
          message: data.errorMessage || "Connection failed",
        })
        toast.error(data.errorMessage || "Connection check failed")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error"
      setConnectionResult({ success: false, message: msg })
      toast.error(msg)
    } finally {
      setChecking(false)
    }
  }
```

**File:** app/(dashboard)/config/page.tsx (L143-159)
```typescript
          <div className="flex items-center gap-3">
            <Switch
              id="is-test"
              checked={isTest}
              onCheckedChange={(val) => {
                setIsTest(val)
                if (typeof window !== "undefined") {
                  localStorage.setItem("experticket_is_test", String(val))
                }
                toast.info(val ? "Test mode enabled" : "Test mode disabled")
              }}
            />
            <Label htmlFor="is-test" className="cursor-pointer">
              {isTest ? "Test Mode ON" : "Test Mode OFF"}
            </Label>
          </div>
        </CardContent>
```

**File:** lib/experticket/storage.ts (L17-36)
```typescript
 */
export function getIsTestMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.IS_TEST_MODE) === "true"
}

/**
 * Persists the test mode setting in the browser's storage.
 *
 * @param enabled - Whether to enable or disable test mode.
 *
 * @example
 * ```typescript
 * setIsTestMode(true);
 * ```
 */
export function setIsTestMode(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.IS_TEST_MODE, String(enabled))
}
```

**File:** instrumentation.ts (L1-9)
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    const { server } = await import("./mocks/server")
    server.listen({
      onUnhandledRequest: "bypass",
    })
    console.log(" [MSW] Mock Service Worker started on server (Node.js runtime)")
  }
}
```

**File:** components/experticket/msw-provider.tsx (L23-48)
```typescript
export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function initMsw() {
      if (
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_API_MOCKING === "enabled" &&
        typeof window !== "undefined"
      ) {
        const { worker } = await import("@/mocks/browser")
        await worker.start({
          onUnhandledRequest: "bypass",
        })
      }
      setReady(true)
    }

    initMsw()
  }, [])

  if (!ready) {
    return undefined
  }

  return <>{children}</>
```

**File:** mocks/handlers.ts (L1-15)
```typescript
import { catalogHandlers } from "./handlers/catalog"
import { availabilityHandlers } from "./handlers/availability"
import { questionsHandlers } from "./handlers/questions"
import { reservationHandlers } from "./handlers/reservation"
import { transactionHandlers } from "./handlers/transaction"
import { cancellationHandlers } from "./handlers/cancellation"

export const handlers = [
  ...catalogHandlers,
  ...availabilityHandlers,
  ...questionsHandlers,
  ...reservationHandlers,
  ...transactionHandlers,
  ...cancellationHandlers,
]
```

**File:** mocks/server.ts (L1-4)
```typescript
import { setupServer } from "msw/node"
import { handlers } from "./handlers"

export const server = setupServer(...handlers)
```

**File:** lib/experticket/tools.ts (L1-50)
```typescript
/**
 * @module experticket-tools
 * @description Agentic AI tools for interacting with the Experticket API.
 *
 * @remarks
 * These tools provide a semantic interface for an LLM to assist users with
 * discovery, availability, and transaction management.
 */

import { experticketService } from "./service"
import type { ReservationRequest, CancellationRequest } from "./types"

/**
 * Consults the catalog to find which products are available for purchase.
 *
 * @param language - ISO 639-1 language code (default: "en").
 * @returns A promise that resolves to the normalized product catalog.
 *
 * @example
 * ```typescript
 * const catalog = await get_available_products("en");
 * ```
 */
export async function get_available_products(language: string = "en") {
  return await experticketService.getCatalog(language)
}

/**
 * Validates availability and calculates the total price for a selection of products on specific dates.
 *
 * @param productIds - List of unique product identifiers to check.
 * @param dates - List of ISO 8601 date strings to check for availability.
 * @returns A promise that resolves to both capacity and pricing information.
 *
 * @example
 * ```typescript
 * const info = await check_availability_and_price(["prod1"], ["2024-12-25"]);
 * ```
 */
export async function check_availability_and_price(productIds: string[], dates: string[]) {
  const [capacity, pricing] = await Promise.all([
    experticketService.getCapacity({ ProductIds: productIds.join(","), Dates: dates.join(",") }),
    experticketService.getRealTimePrices({
      AccessDateTime: dates[0], // Using the first date as primary
      Products: productIds.map((id) => ({ ProductId: id })),
    }),
  ])

  return { capacity, pricing }
}
```

**File:** lib/experticket/tools.ts (L57-101)
```typescript
 *
 * @param reservationData - The full reservation request payload including products and answers.
 * @returns A promise that resolves to the reservation result.
 *
 * @example
 * ```typescript
 * const result = await create_reservation({ ... });
 * ```
 */
export async function create_reservation(reservationData: ReservationRequest) {
  return await experticketService.createReservation(reservationData)
}

/**
 * Consults the current status and details of a specific transaction or sale.
 *
 * @param saleId - The unique identifier of the sale to look up.
 * @returns A promise that resolves to the transaction details.
 *
 * @example
 * ```typescript
 * const status = await get_transaction_status("SALE123");
 * ```
 */
export async function get_transaction_status(saleId: string) {
  return await experticketService.listTransactions({ SaleId: saleId })
}

/**
 * Submits a request to cancel an existing transaction.
 *
 * @remarks
 * This is a SENSITIVE tool and requires human-in-the-loop (HITL) approval.
 *
 * @param cancellationData - Request including sale ID and reason code.
 * @returns A promise that resolves to the result of the cancellation request.
 *
 * @example
 * ```typescript
 * const result = await cancel_transaction({ SaleId: "S123", Reason: 4 });
 * ```
 */
export async function cancel_transaction(cancellationData: CancellationRequest) {
  return await experticketService.createCancellation(cancellationData)
}
```

**File:** components/app-shell.tsx (L47-88)
```typescript
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">Experticket</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile nav drawer */}
```

**File:** app/(dashboard)/layout.tsx (L1-8)
```typescript
import { AppShell } from "@/components/app-shell"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}


```

**File:** package.json (L5-11)
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint app components hooks lib --cache",
    "lint:fix": "eslint app components hooks lib --fix --cache"
  },
```

**File:** package.json (L56-68)
```json
    "next": "16.1.6",
    "next-themes": "^0.4.6",
    "react": "19.2.4",
    "react-day-picker": "9.13.2",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.54.1",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "swr": "^2.3.3",
    "tailwind-merge": "^3.3.1",
    "vaul": "^1.1.2",
    "zod": "^3.24.1"
```

**File:** informe_experticket.md (L26-39)
```markdown

### Entidades principales y relaciones:
1. **Provider (Proveedor):** Entidad legal/comercial (ej. Parque Temático). Una transacción solo puede contener productos de UN único proveedor.
2. **ProductBase (Categoría):** Agrupador lógico de productos que comparten propiedades (descripciones, condiciones). Puede imponer restricciones de capacidad a nivel de grupo.
3. **Product (Producto):** La unidad comercial de venta (ej. "Entrada Adulto").
4. **Ticket (Entrada):** La unidad mínima de inventario. Un producto puede estar compuesto por varios tickets (ej. un Pack Familiar tiene 2 tickets de adulto y 2 de niño).
5. **Session (Sesión):** Instancia temporal de un producto (fecha/hora). Controla la disponibilidad específica.
6. **Transaction (Transacción):** Registro final de venta que agrupa la selección del cliente y genera los códigos de acceso.

### Ciclo de vida de una transacción:
`Catalog Search` -> `Availability Check (Capacity)` -> `Price Validation` -> `Questions (Data Collection)` -> `Reservation (Lock)` -> `Transaction (Commit)`

### Modelo mental para un equipo de producto e IA:
> "Vendemos **Productos** que son promesas comerciales, pero reservamos **Tickets** que son activos de inventario. El **Proveedor** define las reglas, el **BFF** orquesta la seguridad y el **Agente** asiste al usuario en la navegación de este grafo jerárquico para encontrar la mejor combinación de fecha y precio."
```

**File:** informe_experticket.md (L45-63)
```markdown
| Endpoint | Método | Propósito Funcional | Parámetros (P/Q/H/C) | Request Body | Response Body | Auth | Idempotencia | Riesgo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/catalog` | GET | Descarga de catálogo completo | Q: PartnerId, LanguageCode | - | CatalogResponse | PartnerId | Sí | Bajo |
| `/AvailableLanguages` | GET | Idiomas para documentos | Q: PartnerId, api-version | - | LanguagesResponse | PartnerId | Sí | Bajo |
| `/providers` | GET | Listado resumido de proveedores | Q: PartnerId, ProviderIds, LanguageCode | - | ProvidersResponse | PartnerId | Sí | Bajo |
| `/tags` | GET | Jerarquía de etiquetas | Q: PartnerId | - | TagsResponse | PartnerId | Sí | Bajo |
| `/cataloglastupdateddatetime` | GET | Fecha última actualización | Q: PartnerId | - | LastUpdatedResponse | PartnerId | Sí | Bajo |
| `/availablecapacity` | GET | Consulta de disponibilidad | Q: PartnerId, ProductIds, Dates... | - | AvailableCapacityResponse | PartnerId | Sí | Medio |
| `/RealTimePrices` | POST | Precios dinámicos | - | ProductIds, AccessDates | RealTimePricesResponse | PartnerId | Sí | Medio |
| `/checkticketsquestions` | POST | Preguntas de reserva | - | ProductIds, ProfileIds | TicketQuestionsResponse | PartnerId | Sí | Bajo |
| `/reservation` | POST | Crear reserva temporal | H: Accept, Content-Type | ApiKey, AccessDateTime, Products | ReservationResponse | ApiKey | No | Alto |
| `/reservation` | DELETE | Cancelar reserva temporal | H: Content-Type | ApiKey, ReservationId | BaseResponse | ApiKey | Sí | Medio |
| `/transaction` | POST | Finalizar transacción | H: Content-Type | ApiKey, ReservationId, Products | TransactionResponse | ApiKey | No | Crítico |
| `/transaction` | GET | Buscar/Listar transacciones | Q: ApiKey, SaleId, Dates, Page... | - | TransactionListResponse | ApiKey | Sí | Bajo |
| `/transactiondocuments` | GET | Obtener URLs de documentos | Q: ApiKey, id (SaleId), IncludeLangs | - | TransactionDocumentsResponse | ApiKey | Sí | Bajo |
| `/transactionaccesscodes` | GET | Obtener códigos de acceso | Q: ApiKey, SaleId, InternalCodes | - | AccessCodesResponse | ApiKey | Sí | Bajo |
| `/cancellationrequest` | POST | Solicitar cancelación | H: Content-Type | ApiKey, SaleId, Reason | CancellationRequestResponse | ApiKey | No | Alto |
| `/cancellationrequest` | GET | Listar solicitudes cancelación | Q: ApiKey, SaleId, Dates, Status | - | CancellationListResponse | ApiKey | Sí | Bajo |

```

**File:** informe_experticket.md (L88-94)
```markdown
### Estrategia de Seguridad en Next.js 16:
1. **Server-Only Boundaries:** El cliente de Experticket (`server-client.ts`) debe estar marcado o restringido para ejecución exclusiva en el servidor. Nunca debe importarse en componentes `"use client"`.
2. **Secret Management:** Uso estricto de `process.env` para `EXPERTICKET_API_KEY`. No exponer estas variables con el prefijo `NEXT_PUBLIC_`.
3. **Proxy Route Handlers:** Todas las llamadas desde el navegador irán a `/api/experticket/*`. El Route Handler inyectará la `ApiKey` y el `PartnerId` de forma transparente al cliente.
4. **Rate Limiting:** Implementar limitación por IP en los Route Handlers de Next.js para evitar el drenaje de cuota de la API de Experticket por actores maliciosos.
5. **Auditoría:** Loguear cada transacción finalizada asociándola al ID de usuario de la sesión de Next.js para trazabilidad completa.

```

**File:** informe_experticket.md (L228-235)
```markdown

| Situación | Síntoma | Causa | Acción Automática | Severidad |
| :--- | :--- | :--- | :--- | :--- |
| Timeout API | 504 Gateway Timeout | Carga alta o red | Retry (max 3) | Alta |
| Cupo agotado | Success: false | Alguien compró antes | Informar y refrescar | Media |
| Reserva expirada| Error 400 | > 20 min inactividad | Reiniciar checkout | Crítica |
| Auth Failure | 401 Unauthorized | API Key incorrecta | Alerta inmediata | Bloqueante |

```

**File:** informe_experticket.md (L304-307)
```markdown
### Enums Críticos:
- **PaymentStatus:** `1: Not cashed`, `3: Cashed`, `4: Refunded`.
- **ProductStatus:** `2: Confirmed`, `4: Cancelled`.
- **CancellationReason:** `4: Common disease`, `6: Integration problems`.
```
