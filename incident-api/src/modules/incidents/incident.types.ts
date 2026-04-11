import type { Document, Types } from "mongoose"

export type IncidentStatus = "open" | "in progress" | "resolved"
export type IncidentPriority = "low" | "medium" | "high"

export interface Incident extends Document {
  title: string
  description: string
  status: IncidentStatus
  priority: IncidentPriority
  assignee: string
  creatorId: Types.ObjectId | string
  createdAt: Date
  updatedAt?: Date
}

export interface CreateIncidentInput {
  title: string
  description: string
  priority: IncidentPriority
  assignee: string
  creatorId?: string
}

export interface UpdateIncidentInput {
  title?: string
  description?: string
  status?: IncidentStatus
  priority?: IncidentPriority
  assignee?: string
}
