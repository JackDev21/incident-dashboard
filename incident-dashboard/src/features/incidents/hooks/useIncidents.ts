import { getIncidents, deleteIncident, getAssignees } from "../services/incidents.service"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"
import { useToast } from "@/app/context/useToast"
import { useAuth } from "@/features/auth/context/AuthContext"
import i18n from "@/i18n"
import { incidentQueryKeys } from "../queryKeys"

export const useIncidents = (page: number, filters: Partial<IncidentFiltersState> = {}) => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()

  const {
    data: paginatedData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: incidentQueryKeys.list(page, filters),
    queryFn: () => getIncidents(page, 12, filters),
    enabled: isAuthenticated,
  })

  const { data: assignees = [] } = useQuery({
    queryKey: incidentQueryKeys.assignees,
    queryFn: getAssignees,
    enabled: isAuthenticated,
  })

  const { mutate: removeIncident } = useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentQueryKeys.lists() })
      showToast(i18n.t("toast.incidentDeleted"), "danger")
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
