import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"

export const incidentQueryKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentQueryKeys.all, "list"] as const,
  list: (page: number, filters: Partial<IncidentFiltersState> = {}) =>
    [...incidentQueryKeys.lists(), page, filters] as const,
  details: () => [...incidentQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentQueryKeys.details(), id] as const,
  assignees: ["incident-assignees"] as const,
}
