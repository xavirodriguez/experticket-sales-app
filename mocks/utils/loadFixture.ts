// Use Vite's glob import to load all JSON fixtures at build time.
// This ensures they are available in both Browser and Node environments.
const fixtures = import.meta.glob("../fixtures/experticket/**/*.json", {
  eager: true,
  import: "default",
})

/**
 * Loads a fixture from the pre-loaded fixtures map.
 * This works in both Node (Vitest) and Browser environments.
 *
 * @param relativePath - The path relative to mocks/fixtures/experticket/
 * @returns The parsed JSON content.
 * @throws Error if the fixture is not found.
 */
export function loadFixture<T>(relativePath: string): T {
  // Construct the key as it appears in the glob (relative to this file)
  const key = `../fixtures/experticket/${relativePath}`
  const fixture = fixtures[key]

  if (!fixture) {
    throw new Error(`Fixture not found: ${relativePath} (looked for key: ${key})`)
  }

  return fixture as T
}
