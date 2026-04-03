import type { Incident, UpdateIncidentInput } from "./incident.types"
import { IncidentModel } from "./incident.model"
import { AppError } from "../../middleware"

export const getAllIncidents = async (): Promise<Incident[]> => {
  return IncidentModel.find().sort({ createdAt: -1 })
}

export const getIncidentById = async (id: string): Promise<Incident> => {
  const incident = await IncidentModel.findById(id)
  if (!incident) {
    throw new AppError(404, `Incident with ID ${id} not found`)
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
      throw new AppError(400, `Failed to create incident: ${error.message}`)
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
      throw new AppError(404, `Incident with ID ${id} not found`)
    }
    return incident
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    if (error instanceof Error) {
      throw new AppError(400, `Failed to update incident: ${error.message}`)
    }
    throw error
  }
}

export const deleteIncident = async (id: string): Promise<void> => {
  const incident = await IncidentModel.findByIdAndDelete(id)
  if (!incident) {
    throw new AppError(404, `Incident with ID ${id} not found`)
  }
}
