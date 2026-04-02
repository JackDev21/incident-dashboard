import { incidentsMock } from "@/features/incidents/mock/incident.mock"
import type { Incident } from "@/features/incidents/types/incident.types"

export const getIncidents = async (): Promise<Incident[]> => {
  return Promise.resolve(incidentsMock)
}

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  const incident = incidentsMock.find((incident) => incident.id === id)
  return Promise.resolve(incident || null)
}

export const createIncident = async (newIncident: Omit<Incident, "id" | "createdAt">): Promise<Incident> => {
  const incident: Incident = {
    ...newIncident,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString().split("T")[0],
  }

  incidentsMock.push(incident)

  return Promise.resolve(incident)
}

export const deleteIncident = async (id: string): Promise<void> => {
  const index = incidentsMock.findIndex((incident) => incident.id === id)
  if (index !== -1) {
    incidentsMock.splice(index, 1)
  }
  return Promise.resolve()
}
