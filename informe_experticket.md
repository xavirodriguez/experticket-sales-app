# Informe Técnico de Integración: API de Experticket

## 1. Resumen ejecutivo
La API de Experticket es una interfaz REST robusta diseñada para la gestión integral del ciclo de vida de venta de entradas y servicios de ocio. Permite la integración con múltiples proveedores bajo un modelo de datos jerárquico que abarca desde la consulta de catálogos hasta la emisión de tickets con códigos de barras.

**Capacidades de negocio:**
- Descubrimiento dinámico de productos y proveedores.
- Gestión de inventario con control de cupos (quotas) y sesiones.
- Motor de precios en tiempo real para estrategias de yield management.
- Flujo transaccional garantizado mediante un sistema de pre-reservas con expiración.
- Gestión post-venta (cancellation requests) y recuperación de documentos (PDF/Invoices).

**Madurez de la spec:** Media. Aunque la documentación es extensa y funcional, presenta inconsistencias en el naming (PascalCase vs camelCase), duplicidad de estructuras de respuesta y dependencias de parámetros codificados en URL que requieren un manejo cuidadoso.

**Riesgos principales:**
1. **Inconsistencia de precios:** El precio puede variar entre la consulta del catálogo y la reserva.
2. **Expiración de reservas:** Ventanas de tiempo críticas (ej. 20 min) que requieren sincronización con la UI.
3. **Complejidad de "Combined Products":** Lógica no trivial para productos que agrupan múltiples servicios.

**Recomendación de enfoque:** Integración vía **BFF (Backend-for-Frontend)** en Next.js 16. Este enfoque permite normalizar las respuestas inconsistentes, ocultar secretos de autenticación y proporcionar una API estable y tipada tanto para el frontend como para agentes de IA.

---

## 2. Lectura del dominio
El modelo de negocio de Experticket se basa en una jerarquía estricta que separa la oferta comercial de la unidad de acceso técnica.

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

---

## 3. Inventario completo de la API

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

### Agrupación por capacidades funcionales:
1. **Descubrimiento (Discovery):** `/catalog`, `/providers`, `/tags`.
2. **Disponibilidad y Precio (Inventory):** `/availablecapacity`, `/RealTimePrices`, `/cataloglastupdateddatetime`.
3. **Recolección de Datos (Questions):** `/checkticketsquestions`.
4. **Operaciones Transaccionales (Checkout):** `/reservation` (POST/DELETE), `/transaction` (POST).
5. **Gestión Post-Venta (Post-Sale):** `/transaction` (GET), `/transactiondocuments`, `/transactionaccesscodes`, `/cancellationrequest`.

### Endpoints Críticos:
- **Flujo de reserva:** `/reservation` (POST). Cualquier fallo aquí detiene el funnel de conversión.
- **Flujo de pago:** `/transaction` (POST). Es el punto de no retorno donde se emiten los tickets.

### Candidatos para herramientas de IA (Tools):
- **Lectura:** `/catalog` (para ofrecer productos), `/availablecapacity` (para consultar disponibilidad).
- **Soporte:** `/transaction` (GET) (para ayudar al cliente a encontrar su pedido), `/transactiondocuments` (para reenviar tickets).

---

## 4. Autenticación, autorización y seguridad
La API utiliza un esquema basado en **ApiKey** y **PartnerId** pasados como parámetros de consulta (Query Params).

### Riesgos identificados:
- **Exposición de Secretos:** Pasar la `ApiKey` en la URL es una práctica de riesgo si no se media a través de un backend, ya que puede quedar registrada en logs de red, proxies y el historial del navegador.
- **Inconsistencia de Naming:** Algunos endpoints piden `ApiKey` y otros `ApiKeyEncoded`.

### Estrategia de Seguridad en Next.js 16:
1. **Server-Only Boundaries:** El cliente de Experticket (`server-client.ts`) debe estar marcado o restringido para ejecución exclusiva en el servidor. Nunca debe importarse en componentes `"use client"`.
2. **Secret Management:** Uso estricto de `process.env` para `EXPERTICKET_API_KEY`. No exponer estas variables con el prefijo `NEXT_PUBLIC_`.
3. **Proxy Route Handlers:** Todas las llamadas desde el navegador irán a `/api/experticket/*`. El Route Handler inyectará la `ApiKey` y el `PartnerId` de forma transparente al cliente.
4. **Rate Limiting:** Implementar limitación por IP en los Route Handlers de Next.js para evitar el drenaje de cuota de la API de Experticket por actores maliciosos.
5. **Auditoría:** Loguear cada transacción finalizada asociándola al ID de usuario de la sesión de Next.js para trazabilidad completa.

---

## 5. Contratos de datos y calidad del esquema
El esquema de datos refleja un sistema maduro pero con una evolución orgánica que ha dejado inconsistencias técnicas.

### Análisis de Schemas:
- **Modelos Principales:** El objeto `Transaction` es el más complejo, conteniendo jerarquías de `Product`, `Ticket` y `EconomicMovement`.
- **Naming Inconsistente:** Se observa uso de PascalCase en las respuestas de la API (`Success`, `ErrorMessage`, `Transactions`) lo cual choca con las convenciones camelCase de JavaScript/TypeScript.
- **Nullability:** La spec no es estricta con campos opcionales vs nullable. Muchos campos desaparecen si son null en lugar de enviarse explícitamente como null.
- **Formatos:** Fechas en ISO 8601, pero con variaciones en la precisión de milisegundos. Los importes son numéricos, usualmente con 2 decimales.

### Riesgos de integración:
- **TypeScript:** El uso de interfaces generadas automáticamente puede ser peligroso debido a la falta de definición de "required fields" en la spec. Se recomienda usar `Partial<T>` o validación en runtime.
- **XML vs JSON:** Aunque soporta ambos, la implementación actual en Next.js está optimizada para JSON. Forzar XML podría romper el tipado automático.
- **Versionado:** El parámetro `api-version` (ej. 3.58) es crítico. No enviarlo puede devolver esquemas antiguos e incompatibles.

---

## 6. Flujos de negocio end-to-end

### Flujo A: Compra estándar (Happy Path)
1. **Consulta Catálogo:** GET `/catalog` para mostrar oferta.
2. **Validación Disponibilidad:** GET `/availablecapacity` para la fecha elegida.
3. **Captura de Requisitos:** POST `/checkticketsquestions` para saber qué datos pide el proveedor (ej. nombre, DNI).
4. **Pre-reserva:** POST `/reservation` para bloquear plazas por N minutos.
5. **Cierre:** POST `/transaction` enviando el `ReservationId`.

### Flujo B: Post-Venta
1. **Búsqueda:** GET `/transaction?SaleId=XXX`.
2. **Documentación:** GET `/transactiondocuments?id=XXX`.
3. **Cancelación:** POST `/cancellationrequest` (Requiere validación previa de `CancellationConditions` recibidas en la transacción).

---

## 7. Diseño de integración en Next.js 16
Propuesta arquitectónica basada en el patrón **Adapter-Service-Handler**.

### Estructura de carpetas:
```text
/lib/experticket
  ├── types.ts         # Tipos puros de la API externa
  ├── server-client.ts # Cliente HTTP centralizado (fetch + auth)
  ├── adapter.ts      # Normalización: API Externa -> Dominio Interno
  ├── schema.ts       # Validaciones Zod (Hardening)
  └── service.ts      # Lógica de orquestación (Retries, Circuit Breaking)
/app/api/experticket
  └── [domain]/route.ts # Handlers públicos
```

### Capas y Responsabilidades:
- **Route Handlers:** Solo validan la sesión del usuario y delegan en el `service`.
- **Service:** Maneja la lógica de negocio, reintentos y mapeo de errores.
- **Adapter:** Transforma PascalCase a camelCase y maneja inconsistencias de listas (arrays vs objetos).

---

## 8. Diseño para IA agéntica
Para que un agente (LLM) use esta API, necesitamos tools con esquemas estrictos y descripciones funcionales semánticas.

### Tools Recomendadas:

1. **`get_available_products`**
   - **Propósito:** Consultar qué se puede comprar.
   - **Input:** `providerId` (opcional), `language`.
   - **Guardrail:** Solo lectura. No requiere confirmación.

2. **`check_availability_and_price`**
   - **Propósito:** Validar si hay hueco y cuánto cuesta en una fecha.
   - **Input:** `productIds`, `dates`.
   - **Guardrail:** Cachear resultados para evitar spam a la API.

3. **`create_reservation` (Sensible)**
   - **Propósito:** Bloquear inventario.
   - **Riesgo:** Genera un estado temporal en el servidor.
   - **Human-in-the-loop:** Requiere que el usuario confirme la selección antes de ejecutar.

4. **`get_transaction_status`**
   - **Propósito:** Consultar estado de una compra.
   - **Input:** `saleId`.
   - **Privacidad:** Filtrar datos sensibles (ej. datos de pago) antes de entregar al LLM.

### Guardrails de Agente:
- **Idempotencia:** Nunca permitir que el agente reintente un POST `/transaction` sin un ID de correlación único generado en el cliente.
- **Compensación:** Si `create_transaction` falla pero el cobro se realizó, el agente debe disparar un flujo de "asistencia humana" inmediatamente.

---

## 9. Diseño de API interna propia
Para el frontend y agentes de IA, se recomienda una API interna (BFF) que normalice el dominio de Experticket.

**Propuesta de Contrato Normalizado (ej. `/api/v1/products`):**
```json
{
  "id": "prod_123",
  "name": "Adult Ticket",
  "price": {
    "amount": 25.50,
    "currency": "EUR"
  },
  "inventory": {
    "hasSessions": true,
    "available": 10
  }
}
```

**Abstracciones Clave:**
- **Unificación de IDs:** Mapear `SaleId` y `TransactionId` a un único `externalId`.
- **Estandarización de Errores:** Convertir códigos de error de Experticket a tipos HTTP estándar (400 para cupo lleno, 404 para ticket no encontrado).

---

## 10. Estrategia de implementación TypeScript
Un enfoque estrictamente tipado es la mejor defensa contra una API de terceros inestable.

1. **Generación de Tipos:** No confiar ciegamente en la spec. Usar `openapi-typescript` para generar la base y extenderla manualmente en un archivo `overrides.d.ts`.
2. **Money Values:** Usar tipos `number` para cálculos internos pero siempre redondear a 2 decimales en el Adapter.
3. **Manejo de Fechas:** Usar `date-fns` y strings ISO 8601. Evitar objetos `Date` nativos de JS en la capa de transporte.
4. **Validation Layer:** Usar `Zod` para validar la respuesta de Experticket ANTES de que llegue al resto del sistema.

```typescript
const CatalogSchema = z.object({
  Success: z.boolean(),
  Providers: z.array(ProviderSchema).optional(),
});
```

---

## 11. Manejo de errores y resiliencia
La API de Experticket puede fallar por timeouts o errores de lógica de negocio (ej. reserva expirada).

### Matriz de Errores:

| Situación | Síntoma | Causa | Acción Automática | Severidad |
| :--- | :--- | :--- | :--- | :--- |
| Timeout API | 504 Gateway Timeout | Carga alta o red | Retry (max 3) | Alta |
| Cupo agotado | Success: false | Alguien compró antes | Informar y refrescar | Media |
| Reserva expirada| Error 400 | > 20 min inactividad | Reiniciar checkout | Crítica |
| Auth Failure | 401 Unauthorized | API Key incorrecta | Alerta inmediata | Bloqueante |

---

## 12. Testing Strategy

1. **Unit Tests:** Probar los `Adapters` (Transformación de datos) con mocks estáticos.
2. **Integration Tests:** Usar **MSW (Mock Service Worker)** para simular la API de Experticket en diversos escenarios (éxito, fallo de red, respuesta lenta).
3. **Contract Testing:** Validar periódicamente que la API real de Experticket sigue cumpliendo los Schemas de Zod definidos.
4. **Agent Testing:** Pruebas de "Tool Call" para asegurar que el LLM genera los parámetros correctos para `/reservation` basándose en el catálogo.

**Prioridad:** El flujo de `/reservation` -> `/transaction` debe tener una cobertura del 100% de escenarios de error antes de salir a producción.

---

## 12.5 Estrategia de Mocking (Sandbox mode)
Para facilitar el desarrollo y las pruebas sin afectar al entorno de producción, se ha implementado una capa de **Mocking via MSW (Mock Service Worker)**.

**Activación:**
Se controla mediante la variable de entorno `NEXT_PUBLIC_API_MOCKING=enabled`.

**Arquitectura de Mocking:**
1. **Server-side:** El archivo `instrumentation.ts` inicializa el servidor de MSW en el runtime de Node.js de Next.js. Esto intercepta las llamadas salientes desde `experticketFetch` hacia la API real.
2. **Client-side:** Permite simular estados de carga o errores directamente en el navegador si fuera necesario (opcional).
3. **Fixtures:** Los datos de prueba residen en `/mocks/fixtures/experticket/`, permitiendo replicar respuestas complejas de catálogos y transacciones.

**Beneficios para IA Agéntica:**
Permite entrenar y validar al agente en un entorno seguro ("Sandbox") donde las transacciones no tienen coste real y se pueden forzar escenarios de error (ej. cupo agotado) para probar la resiliencia del agente.

---

## 13. Observabilidad y operación
Para operar con éxito una integración crítica, necesitamos métricas claras.

**Métricas Sí o Sí (SLIs):**
1. **API Latency:** Tiempo medio de respuesta por endpoint.
2. **Error Rate:** Ratio de errores HTTP vs peticiones totales (objetivo < 0.1%).
3. **Conversion Rate:** % de Reservas que se convierten en Transacciones (Business SLI).
4. **Agent Success Rate:** Ratio de "Tool Calls" exitosas vs fallidas (AI SLI).

**Logging:**
- Usar IDs de correlación (`x-correlation-id`) para rastrear una petición desde el frontend -> Next.js -> Experticket.
- Alertas inmediatas en Slack/PagerDuty para fallos en `/transaction` (Checkout failures).

---

## 14. Huecos, ambigüedades y preguntas abiertas

| Hallazgo | Impacto | Severidad | Mitigación |
| :--- | :--- | :--- | :--- |
| Expiración de Reserva | Incierto | Bloqueante | Validar con Experticket el tiempo exacto. |
| Combined Products | Lógica opaca | Importante | No soportar en Fase 1, solo productos individuales. |
| Barcodes en el POST | Duplicidad | Menor | Confirmar si Experticket los genera o el Partner. |
| Webhooks | Inexistentes | Importante | Requiere Polling para confirmar pagos asíncronos. |

---

## 15. Recomendación final y Roadmap
La integración es viable y estratégica, pero requiere una capa de defensa robusta.

**Roadmap Sugerido:**
1. **Fase 1 (Cimentación):** Cliente HTTP tipado, Mocks (MSW) y Adapters básicos de catálogo.
2. **Fase 2 (Checkout):** Implementación de reserva y transacción con reintentos.
3. **Fase 3 (Agente IA):** Exposición de Tools al LLM con guardrails y monitoreo específico.
4. **Fase 4 (Hardening):** Circuit Breaking avanzado y optimización de caché para el catálogo.

---

## 16. Anexos técnicos

### Enums Críticos:
- **PaymentStatus:** `1: Not cashed`, `3: Cashed`, `4: Refunded`.
- **ProductStatus:** `2: Confirmed`, `4: Cancelled`.
- **CancellationReason:** `4: Common disease`, `6: Integration problems`.

### Propuesta de Cliente SDK (TypeScript):
```typescript
class ExperticketClient {
  constructor(private config: Config) {}
  async getCatalog(lang: string): Promise<Catalog>;
  async reserve(data: ReservationInput): Promise<Reservation>;
  async finalize(id: string): Promise<Transaction>;
}
```

**OperationIds clave:** `GetCatalog`, `CreateReserve`, `CommitSale`.
