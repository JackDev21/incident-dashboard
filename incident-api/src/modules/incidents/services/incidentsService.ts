import type { Incident, UpdateIncidentInput } from "../types/incidentTypes"
import { incidentRepository } from "../repositories/mongoRepository"
import { exactMatchesAssignee } from "../utils/assignee"
import { createAppError } from "../../../middleware/http/errorHandler"
import { io } from "../../../socket"

type IncidentFilters = {
  status?: string
  priority?: string
  assignee?: string
  fromDate?: string
  toDate?: string
}

type RealtimeIncidentPayload = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string
  creatorId?: unknown
  createdAt: Date | string
}

const buildRealtimeIncidentPayload = (incident: Incident): RealtimeIncidentPayload => {
  const source = incident as unknown as Record<string, unknown>
  const idValue = (source.id as string | undefined) || String(source._id)

  return {
    id: idValue,
    title: String(source.title ?? ""),
    description: String(source.description ?? ""),
    status: String(source.status ?? "open"),
    priority: String(source.priority ?? "low"),
    assignee: String(source.assignee ?? ""),
    creatorId: source.creatorId,
    createdAt: (source.createdAt as Date | string | undefined) ?? new Date().toISOString(),
  }
}

const buildIncidentQuery = (filters: IncidentFilters): Record<string, unknown> => {
  const query: Record<string, unknown> = {}

  if (filters.status) query.status = filters.status
  if (filters.priority) query.priority = filters.priority

  if (filters.fromDate || filters.toDate) {
    const createdAtFilter: { $gte?: Date; $lte?: Date } = {}
    if (filters.fromDate) createdAtFilter.$gte = new Date(filters.fromDate)
    if (filters.toDate) createdAtFilter.$lte = new Date(`${filters.toDate}T23:59:59.999Z`)
    query.createdAt = createdAtFilter
  }

  return query
}

export const getAllIncidents = async (
  page: number,
  limit: number,
  filters: IncidentFilters = {},
): Promise<{ data: Incident[]; total: number; page: number; totalPages: number }> => {
  const query = buildIncidentQuery(filters)

  if (filters.assignee) {
    const matchingIncidents = (await incidentRepository.findAll(query)) as Incident[]
    const filteredData = matchingIncidents.filter((incident) =>
      exactMatchesAssignee(incident.assignee, filters.assignee),
    )

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
    const payload = buildRealtimeIncidentPayload(saved)
    if (socketId) {
      console.log(`[WS] Emitting incident:created to ${io.engine.clientsCount} client(s) excluding ${socketId}`)
      io.except(socketId).emit("incident:created", payload)
    } else {
      console.log(`[WS] Emitting incident:created to ${io.engine.clientsCount} client(s)`)
      io.emit("incident:created", payload)
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
    const payload = buildRealtimeIncidentPayload(incident)
    if (socketId) {
      console.log(`[WS] Emitting incident:updated to ${io.engine.clientsCount} client(s) excluding ${socketId}`)
      io.except(socketId).emit("incident:updated", payload)
    } else {
      console.log(`[WS] Emitting incident:updated to ${io.engine.clientsCount} client(s)`)
      io.emit("incident:updated", payload)
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
