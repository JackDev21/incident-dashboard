import { useContext } from "react"
import { ChatFiltersContext } from "./ChatFiltersContext"
import type { ChatFiltersContextValue } from "./ChatFiltersContext"

export const useChatFilters = (): ChatFiltersContextValue => {
  const ctx = useContext(ChatFiltersContext)
  if (!ctx) throw new Error("useChatFilters must be used within ChatFiltersProvider")
  return ctx
}
