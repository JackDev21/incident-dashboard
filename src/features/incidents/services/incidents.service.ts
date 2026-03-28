import { incidentsMock } from "@/features/incidents/mock/incident.mock"
import type { Incident } from "@/features/incidents/types/incident.types"

export const getIncidents = async (): Promise<Incident[]> => {
  return Promise.resolve(incidentsMock)
}
