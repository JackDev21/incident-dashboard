import { useState } from "react"
import { ChatFiltersContext } from "./ChatFiltersContext"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"

export const ChatFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatFilters, setChatFilters] = useState<IncidentFiltersState | null>(null)

  return <ChatFiltersContext.Provider value={{ chatFilters, setChatFilters }}>{children}</ChatFiltersContext.Provider>
}
