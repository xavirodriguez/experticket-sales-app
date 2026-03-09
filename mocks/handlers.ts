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
