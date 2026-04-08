import type { Request, Response } from "express"
import * as incidentService from "./incident.service"
import { sendSuccess } from "../../utils/responses"

export const getIncidents = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 12
  const filters = {
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    priority: typeof req.query.priority === "string" ? req.query.priority : undefined,
    assignee: typeof req.query.assignee === "string" ? req.query.assignee : undefined,
  }

  const incidents = await incidentService.getAllIncidents(page, limit, filters)

  sendSuccess(res, incidents, "Incidents retrieved successfully")
}

export const getAssignees = async (_req: Request, res: Response): Promise<void> => {
  const assignees = await incidentService.getUniqueAssignees()
  sendSuccess(res, assignees, "Assignees retrieved successfully")
}

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const incident = await incidentService.getIncidentById(id)
  sendSuccess(res, incident, "Incident retrieved successfully")
}

export const createIncident = async (req: Request, res: Response): Promise<void> => {
  const socketId = (req.get("x-socket-id") as string) || undefined
  console.log(`[API] createIncident received x-socket-id: ${socketId}`)
  const incident = await incidentService.createIncident(req.body, socketId)
  sendSuccess(res, incident, "Incident created successfully", 201)
}

export const updateIncident = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const socketId = (req.get("x-socket-id") as string) || undefined
  console.log(`[API] updateIncident received x-socket-id: ${socketId}`)
  const incident = await incidentService.updateIncident(id, req.body, socketId)
  sendSuccess(res, incident, "Incident updated successfully")
}

export const deleteIncident = async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const socketId = (req.get("x-socket-id") as string) || undefined
  console.log(`[API] deleteIncident received x-socket-id: ${socketId}`)
  await incidentService.deleteIncident(id, socketId)
  sendSuccess(res, null, "Incident deleted successfully", 204)
}
