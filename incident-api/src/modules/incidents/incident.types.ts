import type { Document } from "mongoose"

export type IncidentStatus = "open" | "in progress" | "resolved"
export type IncidentPriority = "low" | "medium" | "high"

export interface Incident extends Document {
  title: string
  description: string
  status: IncidentStatus
  priority: IncidentPriority
  assignee: string
  createdAt: Date
  updatedAt?: Date
}

export interface CreateIncidentInput {
  title: string
  description: string
  priority: IncidentPriority
  assignee: string
}

export interface UpdateIncidentInput {
  title?: string
  description?: string
  status?: IncidentStatus
  priority?: IncidentPriority
  assignee?: string
}
