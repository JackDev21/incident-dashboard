import type { Incident, UpdateIncidentInput } from "./incident.types"
import { IncidentModel } from "./incident.model"
import { createAppError } from "../../middleware"

type IncidentFilters = {
  status?: string
  priority?: string
  assignee?: string
}

export const getAllIncidents = async (
  page: number,
  limit: number,
  filters: IncidentFilters = {},
): Promise<{ data: Incident[]; total: number; page: number; totalPages: number }> => {
  const skip = (page - 1) * limit

  const query: Record<string, unknown> = {}
  if (filters.status) query.status = filters.status
  if (filters.priority) query.priority = filters.priority
  if (filters.assignee) query.assignee = { $regex: filters.assignee, $options: "i" }

  const total = await IncidentModel.countDocuments(query)
  const data = await IncidentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

  return { data, total, page, totalPages: Math.ceil(total / limit) }
}

export const getUniqueAssignees = async (): Promise<string[]> => {
  const assignees = await IncidentModel.distinct("assignee")
  return (assignees as string[]).filter(Boolean).sort()
}

export const getIncidentById = async (id: string): Promise<Incident> => {
  const incident = await IncidentModel.findById(id)
  if (!incident) {
    throw createAppError(404, `Incident with ID ${id} not found`)
  }
  return incident
}

export const createIncident = async (data: {
  title: string
  description: string
  priority: string
  assignee: string
}): Promise<Incident> => {
  try {
    const incident = new IncidentModel({
      title: data.title,
      description: data.description,
      status: "open",
      priority: data.priority,
      assignee: data.assignee,
    })
    return await incident.save()
  } catch (error) {
    if (error instanceof Error) {
      throw createAppError(400, `Failed to create incident: ${error.message}`)
    }
    throw error
  }
}

export const updateIncident = async (id: string, data: UpdateIncidentInput): Promise<Incident> => {
  try {
    const incident = await IncidentModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    if (!incident) {
      throw createAppError(404, `Incident with ID ${id} not found`)
    }
    return incident
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      throw error
    }
    if (error instanceof Error) {
      throw createAppError(400, `Failed to update incident: ${error.message}`)
    }
    throw error
  }
}

export const deleteIncident = async (id: string): Promise<void> => {
  const incident = await IncidentModel.findByIdAndDelete(id)
  if (!incident) {
    throw createAppError(404, `Incident with ID ${id} not found`)
  }
}
