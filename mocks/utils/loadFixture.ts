import availabilityDefault from "../fixtures/experticket/availability/default.json"
import availabilityPrices from "../fixtures/experticket/availability/prices.json"
import cancellationList from "../fixtures/experticket/cancellation/list.json"
import cancellationSuccess from "../fixtures/experticket/cancellation/success.json"
import catalogDefault from "../fixtures/experticket/catalog/default.json"
import catalogLanguages from "../fixtures/experticket/catalog/languages.json"
import catalogLastupdated from "../fixtures/experticket/catalog/lastupdated.json"
import questionsDefault from "../fixtures/experticket/questions/default.json"
import reservationSuccess from "../fixtures/experticket/reservation/success.json"
import transactionAccesscodes from "../fixtures/experticket/transaction/accesscodes.json"
import transactionDocuments from "../fixtures/experticket/transaction/documents.json"
import transactionList from "../fixtures/experticket/transaction/list.json"
import transactionSuccess from "../fixtures/experticket/transaction/success.json"

// Manual mapping of fixtures to replace Vite's glob import.
// This ensures compatibility with both Next.js/Turbopack and Vitest environments.
const fixtures: Record<string, any> = {
  "../fixtures/experticket/availability/default.json": availabilityDefault,
  "../fixtures/experticket/availability/prices.json": availabilityPrices,
  "../fixtures/experticket/cancellation/list.json": cancellationList,
  "../fixtures/experticket/cancellation/success.json": cancellationSuccess,
  "../fixtures/experticket/catalog/default.json": catalogDefault,
  "../fixtures/experticket/catalog/languages.json": catalogLanguages,
  "../fixtures/experticket/catalog/lastupdated.json": catalogLastupdated,
  "../fixtures/experticket/questions/default.json": questionsDefault,
  "../fixtures/experticket/reservation/success.json": reservationSuccess,
  "../fixtures/experticket/transaction/accesscodes.json": transactionAccesscodes,
  "../fixtures/experticket/transaction/documents.json": transactionDocuments,
  "../fixtures/experticket/transaction/list.json": transactionList,
  "../fixtures/experticket/transaction/success.json": transactionSuccess,
}

/**
 * Loads a fixture from the pre-loaded fixtures map.
 * This works in both Node (Vitest) and Browser environments.
 *
 * @param relativePath - The path relative to mocks/fixtures/experticket/
 * @returns The parsed JSON content.
 * @throws Error if the fixture is not found.
 */
export function loadFixture<T>(relativePath: string): T {
  // Construct the key as it appears in the map (relative to this file)
  const key = `../fixtures/experticket/${relativePath}`
  const fixture = fixtures[key]

  if (!fixture) {
    throw new Error(`Fixture not found: ${relativePath} (looked for key: ${key})`)
  }

  return fixture as T
}
