import { createContext } from "react"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"

export type ChatFiltersContextValue = {
  chatFilters: IncidentFiltersState | null
  setChatFilters: (filters: IncidentFiltersState | null) => void
}

export const ChatFiltersContext = createContext<ChatFiltersContextValue | null>(null)
