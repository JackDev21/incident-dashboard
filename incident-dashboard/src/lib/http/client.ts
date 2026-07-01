type ApiEnvelope<T> = {
  success?: boolean
  data?: T
  message?: string
  error?: string
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  auth?: boolean
  onUnauthorized?: "redirect" | "throw"
}

export class HttpRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "HttpRequestError"
  }
}

const readToken = (): string | null => {
  const token = localStorage.getItem("auth_token")
  if (!token || token === "undefined" || token === "null") return null
  return token
}

const clearSessionAndRedirect = (): never => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_user")
  window.location.href = "/login"
  throw new Error("Session expired. Please login again")
}

const parseErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const payload = (await response.clone().json()) as ApiEnvelope<unknown>
    if (typeof payload?.error === "string" && payload.error.trim()) return payload.error
    if (typeof payload?.message === "string" && payload.message.trim()) return payload.message
  } catch {
    // No-op: fallback below.
  }

  return `${fallback} (${response.status})`
}

const parseResponseData = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T> | T
  const wrapped = payload as ApiEnvelope<T>
  if (wrapped && typeof wrapped === "object" && "data" in wrapped && wrapped.data !== undefined) {
    return wrapped.data
  }
  return payload as T
}

export const httpRequest = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", body, headers = {}, auth = true, onUnauthorized = "redirect" } = options

  const finalHeaders: Record<string, string> = { ...headers }
  const token = auth ? readToken() : null

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  if (body !== undefined && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json"
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    if (onUnauthorized === "redirect") {
      clearSessionAndRedirect()
    }
    throw new HttpRequestError("Invalid or expired session", 401)
  }

  if (!response.ok) {
    throw new HttpRequestError(await parseErrorMessage(response, "Request failed"), response.status)
  }

  return parseResponseData<T>(response)
}
