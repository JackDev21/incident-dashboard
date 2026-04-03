import type { Request, Response } from "express"
import * as incidentService from "./incident.service"
import { sendSuccess } from "../../utils/responses"

export const getIncidents = async (_req: Request, res: Response): Promise<void> => {
  const incidents = await incidentService.getAllIncidents()
  sendSuccess(res, incidents, "Incidents retrieved successfully")
}

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const incident = await incidentService.getIncidentById(id)
  sendSuccess(res, incident, "Incident retrieved successfully")
}

export const createIncident = async (req: Request, res: Response): Promise<void> => {
  const incident = await incidentService.createIncident(req.body)
  sendSuccess(res, incident, "Incident created successfully", 201)
}

export const updateIncident = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const incident = await incidentService.updateIncident(id, req.body)
  sendSuccess(res, incident, "Incident updated successfully")
}

export const deleteIncident = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  await incidentService.deleteIncident(id)
  sendSuccess(res, null, "Incident deleted successfully", 204)
}
