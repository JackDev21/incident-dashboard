import type { IncidentPriority } from "../incident.types"

export interface CreateIncidentDTO {
  title: string
  description: string
  priority: IncidentPriority
  assignee: string
}

export const validateCreateIncident = (data: unknown): CreateIncidentDTO => {
  const obj = data as Record<string, unknown>

  if (typeof obj.title !== "string" || obj.title.trim() === "") {
    throw new Error("Title is required and must be a non-empty string")
  }

  if (typeof obj.description !== "string" || obj.description.trim() === "") {
    throw new Error("Description is required and must be a non-empty string")
  }

  if (!["low", "medium", "high"].includes(obj.priority as string)) {
    throw new Error("Priority must be one of: low, medium, high")
  }

  if (typeof obj.assignee !== "string" || obj.assignee.trim() === "") {
    throw new Error("Assignee is required and must be a non-empty string")
  }

  return {
    title: (obj.title as string).trim(),
    description: (obj.description as string).trim(),
    priority: obj.priority as IncidentPriority,
    assignee: (obj.assignee as string).trim(),
  }
}

export const validateUpdateIncident = (data: unknown): Record<string, unknown> => {
  const obj = data as Record<string, unknown>
  const updated: Record<string, unknown> = {}

  if ("title" in obj && obj.title !== undefined) {
    if (typeof obj.title !== "string" || obj.title.toString().trim() === "") {
      throw new Error("Title must be a non-empty string")
    }
    updated.title = (obj.title as string).trim()
  }

  if ("description" in obj && obj.description !== undefined) {
    if (typeof obj.description !== "string" || obj.description.toString().trim() === "") {
      throw new Error("Description must be a non-empty string")
    }
    updated.description = (obj.description as string).trim()
  }

  if ("status" in obj && obj.status !== undefined) {
    if (!["open", "in progress", "resolved"].includes(obj.status as string)) {
      throw new Error("Status must be one of: open, in progress, resolved")
    }
    updated.status = obj.status
  }

  if ("priority" in obj && obj.priority !== undefined) {
    if (!["low", "medium", "high"].includes(obj.priority as string)) {
      throw new Error("Priority must be one of: low, medium, high")
    }
    updated.priority = obj.priority
  }

  if ("assignee" in obj && obj.assignee !== undefined) {
    if (typeof obj.assignee !== "string" || obj.assignee.toString().trim() === "") {
      throw new Error("Assignee must be a non-empty string")
    }
    updated.assignee = (obj.assignee as string).trim()
  }

  if (Object.keys(updated).length === 0) {
    throw new Error("No valid fields to update")
  }

  return updated
}
