import { getIncidents, deleteIncident, getAssignees } from "../services/incidents.service"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"

export const useIncidents = (page: number, filters: Partial<IncidentFiltersState> = {}) => {
  const queryClient = useQueryClient()

  const {
    data: paginatedData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["incidents", page, filters],
    queryFn: () => getIncidents(page, 12, filters),
  })

  const { data: assignees = [] } = useQuery({
    queryKey: ["incident-assignees"],
    queryFn: getAssignees,
  })

  const { mutate: removeIncident } = useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
    },
    onError: (error) => {
      console.error("Error deleting incident:", error)
    },
  })

  return {
    incidents: paginatedData?.data || [],
    pagination: {
      total: paginatedData?.total || 0,
      totalPages: paginatedData?.totalPages || 0,
      currentPage: page,
    },
    assignees,
    loading,
    error,
    removeIncident,
  }
}
