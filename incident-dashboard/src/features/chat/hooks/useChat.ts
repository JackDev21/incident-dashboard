import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { queryChat } from "../services/chat.service"
import { useChatFilters } from "../context/useChatFilters"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const { setChatFilters } = useChatFilters()

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (question: string) => queryChat(question, messages),
    onMutate: (question: string) => {
      setMessages((prev) => [...prev, { role: "user", content: question }])
    },
    onSuccess: ({ answer, appliedFilters }) => {
      setMessages((prev) => [...prev, { role: "assistant", content: answer }])
      if (appliedFilters) {
        const filters: IncidentFiltersState = {
          status: (appliedFilters.status as IncidentFiltersState["status"]) ?? "",
          priority: (appliedFilters.priority as IncidentFiltersState["priority"]) ?? "",
          assignee: appliedFilters.assignee ?? "",
        }
        setChatFilters(filters)
      }
    },
    onError: (error: Error) => {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message}` }])
    },
  })

  const clearMessages = () => {
    setMessages([])
    setChatFilters({ status: "", priority: "", assignee: "" })
  }

  return { messages, sendMessage, isPending, clearMessages }
}
