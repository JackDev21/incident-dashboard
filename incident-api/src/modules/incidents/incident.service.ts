import type { Incident, UpdateIncidentInput } from "./incident.types"
import { IncidentModel } from "./incident.model"
import { matchesAssignee } from "./assignee.utils"
import { createAppError } from "../../middleware"
import { io } from "../../socket"

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

  if (filters.assignee) {
    const matchingIncidents = (await IncidentModel.find(query).sort({ createdAt: -1 }).populate("creatorId", "name")) as Incident[]
    const filteredData = matchingIncidents.filter((incident) => matchesAssignee(incident.assignee, filters.assignee))
    const paginatedData = filteredData.slice(skip, skip + limit)

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      totalPages: Math.ceil(filteredData.length / limit),
    }
  }

  const total = await IncidentModel.countDocuments(query)
  const data = await IncidentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("creatorId", "name")

  return { data, total, page, totalPages: Math.ceil(total / limit) }
}

export const getUniqueAssignees = async (): Promise<string[]> => {
  const assignees = await IncidentModel.distinct("assignee")
  return (assignees as string[]).filter(Boolean).sort()
}

export const getIncidentById = async (id: string): Promise<Incident> => {
  const incident = await IncidentModel.findById(id).populate("creatorId", "name")
  if (!incident) {
    throw createAppError(404, `Incident with ID ${id} not found`)
  }
  return incident
}

export const createIncident = async (
  data: {
    title: string
    description: string
    priority: string
    assignee: string
    creatorId?: string
  },
  socketId?: string,
): Promise<Incident> => {
  try {
    const incident = new IncidentModel({
      title: data.title,
      description: data.description,
      status: "open",
      priority: data.priority,
      assignee: data.assignee,
      creatorId: data.creatorId,
    })
    const saved = await incident.save()
    if (socketId) {
      console.log(`[WS] Emitting incident:created to ${io.engine.clientsCount} client(s) excluding ${socketId}`)
      io.except(socketId).emit("incident:created", saved)
    } else {
      console.log(`[WS] Emitting incident:created to ${io.engine.clientsCount} client(s)`)
      io.emit("incident:created", saved)
    }
    console.log("[WS] incident:created emitted")
    return saved
  } catch (error) {
    if (error instanceof Error) {
      throw createAppError(400, `Failed to create incident: ${error.message}`)
    }
    throw error
  }
}

export const updateIncident = async (id: string, data: UpdateIncidentInput, socketId?: string): Promise<Incident> => {
  try {
    const incident = await IncidentModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    }).populate("creatorId", "name")
    if (!incident) {
      throw createAppError(404, `Incident with ID ${id} not found`)
    }
    if (socketId) {
      console.log(`[WS] Emitting incident:updated to ${io.engine.clientsCount} client(s) excluding ${socketId}`)
      io.except(socketId).emit("incident:updated", incident)
    } else {
      console.log(`[WS] Emitting incident:updated to ${io.engine.clientsCount} client(s)`)
      io.emit("incident:updated", incident)
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

export const deleteIncident = async (id: string, socketId?: string): Promise<void> => {
  const incident = await IncidentModel.findByIdAndDelete(id)
  if (!incident) {
    throw createAppError(404, `Incident with ID ${id} not found`)
  }
  if (socketId) {
    console.log(`[WS] Emitting incident:deleted to ${io.engine.clientsCount} client(s) excluding ${socketId}`)
    io.except(socketId).emit("incident:deleted", { id })
  } else {
    console.log(`[WS] Emitting incident:deleted to ${io.engine.clientsCount} client(s)`)
    io.emit("incident:deleted", { id })
  }
}
