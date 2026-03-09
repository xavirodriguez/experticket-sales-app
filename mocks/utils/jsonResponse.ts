import { HttpResponse } from "msw"

/**
 * Utility to return a standard JSON response using MSW's HttpResponse.
 *
 * @param data - The payload to return.
 * @param status - HTTP status code (default 200).
 * @returns An MSW HttpResponse instance.
 */
export function jsonResponse<T>(data: T, status = 200) {
  return HttpResponse.json(data as any, { status })
}

/**
 * Utility to return a standardized error response.
 *
 * @param message - The error message.
 * @param status - HTTP status code (default 400).
 * @param errorCodes - Optional list of error codes.
 * @returns An MSW HttpResponse instance.
 */
export function errorResponse(message: string, status = 400, errorCodes: string[] = []) {
  return HttpResponse.json(
    {
      Success: false,
      ErrorMessage: message,
      ErrorCodes: errorCodes,
      Timestamp: new Date().toISOString(),
    },
    { status }
  )
}
