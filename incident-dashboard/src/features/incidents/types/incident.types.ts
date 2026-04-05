export type IncidentStatus = "open" | "in progress" | "resolved"

export type IncidentPriority = "low" | "medium" | "high"

export type Incident = {
  id: string
  title: string
  description: string
  status: IncidentStatus
  priority: IncidentPriority
  assignee: string
  createdAt: string
}

export type PaginatedIncidents = {
  data: Incident[]
  total: number
  page: number
  totalPages: number
}
