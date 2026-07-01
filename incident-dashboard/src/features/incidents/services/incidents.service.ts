import type { Incident, PaginatedIncidents } from "@/features/incidents/types/incident.types"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"
import { socket } from "./socket"
import { httpRequest, HttpRequestError } from "@/lib/http/client"

const BASE_URL = `${import.meta.env.VITE_API_URL}/incidents`

export const getIncidents = async (
  page = 1,
  limit = 12,
  filters?: Partial<IncidentFiltersState>,
): Promise<PaginatedIncidents> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (filters?.status) params.set("status", filters.status)
  if (filters?.priority) params.set("priority", filters.priority)
  if (filters?.assignee) params.set("assignee", filters.assignee)
  if (filters?.fromDate) params.set("fromDate", filters.fromDate)
  if (filters?.toDate) params.set("toDate", filters.toDate)

  return httpRequest<PaginatedIncidents>(`${BASE_URL}?${params.toString()}`)
}

export const getAssignees = async (): Promise<string[]> => {
  return (await httpRequest<string[]>(`${BASE_URL}/assignees`)) ?? []
}

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  try {
    return (await httpRequest<Incident | null>(`${BASE_URL}/${id}`)) ?? null
  } catch (error) {
    if (error instanceof HttpRequestError && error.status === 404) {
      return null
    }
    throw error
  }
}

export const createIncident = async (newIncident: Omit<Incident, "id" | "createdAt">): Promise<Incident> => {
  const headers: Record<string, string> = {}
  if (socket?.id) headers["x-socket-id"] = socket.id
  console.log("[WS-client] createIncident headers:", headers)

  return httpRequest<Incident>(BASE_URL, {
    method: "POST",
    headers,
    body: newIncident,
  })
}

export const updateIncident = async (
  id: string,
  updatedFields: Partial<Omit<Incident, "id" | "createdAt">>,
): Promise<Incident> => {
  const headers: Record<string, string> = {}
  if (socket?.id) headers["x-socket-id"] = socket.id
  console.log("[WS-client] updateIncident headers:", headers)

  return httpRequest<Incident>(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers,
    body: updatedFields,
  })
}

export const deleteIncident = async (id: string): Promise<void> => {
  const headers: Record<string, string> = {}
  if (socket?.id) headers["x-socket-id"] = socket.id
  console.log("[WS-client] deleteIncident headers:", headers)

  try {
    await httpRequest<unknown>(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers,
    })
  } catch (error) {
    if (error instanceof HttpRequestError && error.status === 404) {
      return
    }
    throw error
  }
}
