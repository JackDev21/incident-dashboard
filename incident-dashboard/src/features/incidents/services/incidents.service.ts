import type { Incident } from "@/features/incidents/types/incident.types"

const BASE_URL = `${import.meta.env.VITE_API_URL}/incidents`

type ApiResponse<T> = {
  success?: boolean
  data?: T
  message?: string
}

const getApiErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiResponse<unknown>
    if (typeof payload?.message === "string" && payload.message.trim()) {
      return payload.message
    }
  } catch {
    // Ignore JSON parse failures and use fallback.
  }

  return `${fallback} (${response.status})`
}

export const getIncidents = async (): Promise<Incident[]> => {
  const response = await fetch(BASE_URL)
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to fetch incidents"))
  }

  const payload: unknown = await response.json()

  if (Array.isArray(payload)) {
    return payload as Incident[]
  }

  const wrapped = payload as ApiResponse<Incident[]>
  if (Array.isArray(wrapped.data)) {
    return wrapped.data
  }

  return []
}

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  const response = await fetch(`${BASE_URL}/${id}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to fetch incident"))
  }

  const payload: unknown = await response.json()
  const wrapped = payload as ApiResponse<Incident>
  return wrapped.data ?? ((payload as Incident) || null)
}

export const createIncident = async (newIncident: Omit<Incident, "id" | "createdAt">): Promise<Incident> => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newIncident),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to create incident"))
  }

  const payload: unknown = await response.json()
  const wrapped = payload as ApiResponse<Incident>
  return wrapped.data ?? (payload as Incident)
}

export const updateIncident = async (
  id: string,
  updatedFields: Partial<Omit<Incident, "id" | "createdAt">>,
): Promise<Incident> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedFields),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to update incident"))
  }

  const payload: unknown = await response.json()
  const wrapped = payload as ApiResponse<Incident>
  return wrapped.data ?? (payload as Incident)
}

export const deleteIncident = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  })

  if (!response.ok && response.status !== 404) {
    throw new Error(await getApiErrorMessage(response, "Failed to delete incident"))
  }
}
