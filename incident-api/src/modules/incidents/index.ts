export { IncidentModel } from "./models/incidentModel"
export type { Incident, CreateIncidentInput, UpdateIncidentInput } from "./types/incidentTypes"
export * as incidentService from "./services/incidentsService"
export {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
} from "./controllers/incidentsController"
export { default as incidentRoutes } from "./routes/incidentsRoutes"
