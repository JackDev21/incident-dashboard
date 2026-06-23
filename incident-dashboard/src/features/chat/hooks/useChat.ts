import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { queryChat } from "../services/chat.service"
import { useChatFilters } from "../context/useChatFilters"
import type { IncidentFiltersState } from "@/features/incidents/components/IncidentFilters"
import { useToast } from "@/app/context/useToast"
import i18n from "@/i18n"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatMutationInput = {
  question: string
  selection?: { field: string; value: string }
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const { chatFilters, setChatFilters } = useChatFilters()
  const { showToast } = useToast()

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (opts: ChatMutationInput) => queryChat(opts.question, messages, opts.selection, chatFilters),
    onMutate: (opts: ChatMutationInput) => {
      setMessages((prev) => [...prev, { role: "user", content: opts.question }])
    },
    onSuccess: ({ answer, appliedFilters, action }) => {
      setMessages((prev) => [...prev, { role: "assistant", content: answer }])

      if (action === "created") {
        showToast(i18n.t("toast.incidentCreatedSuccess"), "success")
      } else if (action === "updated") {
        showToast(i18n.t("toast.incidentUpdatedSuccess"), "success")
      }

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
      setMessages((prev) => [...prev, { role: "assistant", content: error.message }])
    },
  })

  const clearMessages = () => {
    setMessages([])
    setChatFilters({ status: "", priority: "", assignee: "" })
  }

  return { messages, sendMessage, isPending, clearMessages }
}
