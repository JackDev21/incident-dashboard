import type { Incident } from "@/features/incidents/types/incident.types"

const BASE_URL = `${import.meta.env.VITE_API_URL}/incidents`

export const getIncidents = async (): Promise<Incident[]> => {
  const response = await fetch(BASE_URL)
  const incidents = await response.json()
  return incidents || []
}

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  const response = await fetch(`${BASE_URL}/${id}`)
  const incident = await response.json()
  return incident || null
}

export const createIncident = async (newIncident: Omit<Incident, "id" | "createdAt">): Promise<Incident> => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newIncident),
  })

  const createdIncident = await response.json()
  return createdIncident
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
  const updatedIncident = await response.json()
  return updatedIncident
}

export const deleteIncident = async (id: string): Promise<void> => {
  await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  })
}
