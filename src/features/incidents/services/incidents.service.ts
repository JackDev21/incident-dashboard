import { incidentsMock } from "../mock/incident.mock"
import type { Incident } from "../types/incident.types"

export const getIncidents = async (): Promise<Incident[]> => {
  return Promise.resolve(incidentsMock)
}
