import type { Incident, UpdateIncidentInput } from "./incident.types"
import { incidentRepository } from "./incident.repository"
import { matchesAssignee } from "./assignee.utils"

import { io } from "../../socket"
import { createAppError } from "../../middleware/http/errorHandler"

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
  const query: Record<string, unknown> = {}
  if (filters.status) query.status = filters.status
  if (filters.priority) query.priority = filters.priority

  if (filters.assignee) {
    const matchingIncidents = (await incidentRepository.findAll(query)) as Incident[]
    const filteredData = matchingIncidents.filter((incident) => matchesAssignee(incident.assignee, filters.assignee))

    const skip = (page - 1) * limit
    const paginatedData = filteredData.slice(skip, skip + limit)

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      totalPages: Math.ceil(filteredData.length / limit),
    }
  }

  const total = await incidentRepository.count(query)
  const data = await incidentRepository.findAllPaginated(page, limit, query)

  return { data, total, page, totalPages: Math.ceil(total / limit) }
}

export const getUniqueAssignees = async (): Promise<string[]> => {
  const assignees = await incidentRepository.getUniqueAssignees()
  return (assignees as string[]).filter(Boolean).sort()
}

export const getIncidentById = async (id: string): Promise<Incident> => {
  const incident = await incidentRepository.findById(id)
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
    const saved = await incidentRepository.create({
      ...data,
      status: "open",
    })
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
    const incident = await incidentRepository.update(id, data)
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
  const incident = await incidentRepository.delete(id)
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
