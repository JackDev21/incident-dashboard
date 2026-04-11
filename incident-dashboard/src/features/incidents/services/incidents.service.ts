import type { Incident, PaginatedIncidents } from "@/features/incidents/types/incident.types"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"
import { socket } from "./socket"

const BASE_URL = `${import.meta.env.VITE_API_URL}/incidents`

type ApiResponse<T> = {
  success?: boolean
  data?: T
  message?: string
}

const responseData = <T>(payload: unknown): T | undefined => {
  const wrapped = payload as ApiResponse<T>
  return wrapped?.data
}

const readPayload = async <T>(response: Response): Promise<T> => {
  const payload: unknown = await response.json()
  return responseData<T>(payload) ?? (payload as T)
}

const validateHttpResponse = async (response: Response, fallback: string): Promise<void> => {
  if (!response.ok) {
    throw new Error(await apiErrorBackend(response, fallback))
  }
}

const apiErrorBackend = async (response: Response, fallback: string): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiResponse<unknown>
    if (typeof payload?.message === "string" && payload.message.trim()) {
      return payload.message
    }
  } catch {
    console.error("Failed to parse API error response as JSON")
  }

  return `${fallback} (${response.status})`
}

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token")
  if (token && token !== "undefined" && token !== "null") {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export const getIncidents = async (
  page = 1,
  limit = 12,
  filters?: Partial<IncidentFiltersState>,
): Promise<PaginatedIncidents> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (filters?.status) params.set("status", filters.status)
  if (filters?.priority) params.set("priority", filters.priority)
  if (filters?.assignee) params.set("assignee", filters.assignee)

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: getAuthHeaders(),
  })

  await validateHttpResponse(response, "Failed to fetch incidents")

  const payload: unknown = await response.json()

  const result = responseData<PaginatedIncidents>(payload)

  if (!result) {
    console.error("Unexpected API response format for incidents:", payload)
    throw new Error("Unexpected API response format")
  }

  return result
}

export const getAssignees = async (): Promise<string[]> => {
  const response = await fetch(`${BASE_URL}/assignees`, {
    headers: getAuthHeaders(),
  })
  await validateHttpResponse(response, "Failed to fetch assignees")
  return (await readPayload<string[]>(response)) ?? []
}

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  })

  if (response.status === 404) {
    return null
  }

  await validateHttpResponse(response, "Failed to fetch incident")

  return (await readPayload<Incident | null>(response)) ?? null
}

export const createIncident = async (newIncident: Omit<Incident, "id" | "createdAt">): Promise<Incident> => {
  const headers: Record<string, string> = { ...getAuthHeaders(), "Content-Type": "application/json" }
  if (socket?.id) headers["x-socket-id"] = socket.id
  console.log("[WS-client] createIncident headers:", headers)

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(newIncident),
  })

  await validateHttpResponse(response, "Failed to create incident")

  return await readPayload<Incident>(response)
}

export const updateIncident = async (
  id: string,
  updatedFields: Partial<Omit<Incident, "id" | "createdAt">>,
): Promise<Incident> => {
  const headers: Record<string, string> = { ...getAuthHeaders(), "Content-Type": "application/json" }
  if (socket?.id) headers["x-socket-id"] = socket.id
  console.log("[WS-client] updateIncident headers:", headers)

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updatedFields),
  })

  await validateHttpResponse(response, "Failed to update incident")

  return await readPayload<Incident>(response)
}

export const deleteIncident = async (id: string): Promise<void> => {
  const headers: Record<string, string> = getAuthHeaders()
  if (socket?.id) headers["x-socket-id"] = socket.id
  console.log("[WS-client] deleteIncident headers:", headers)

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers,
  })

  if (!response.ok && response.status !== 404) {
    await validateHttpResponse(response, "Failed to delete incident")
  }
}
