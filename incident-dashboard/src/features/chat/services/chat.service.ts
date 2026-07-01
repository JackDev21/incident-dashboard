import { httpRequest } from "@/lib/http/client"

const BASE_URL = `${import.meta.env.VITE_API_URL}/chat`

type AppliedFilters = {
  status?: string
  priority?: string
  assignee?: string
  fromDate?: string
  toDate?: string
} | null

type ChatData = {
  answer: string
  appliedFilters: AppliedFilters
  action?: "created" | "updated" | null
}

type HistoryMessage = { role: "user" | "assistant"; content: string }

export type ChatResult = { answer: string; appliedFilters: AppliedFilters; action?: "created" | "updated" | null }

export const queryChat = async (
  question: string,
  history: HistoryMessage[] = [],
  selection?: { field: string; value: string },
  chatFilters?: AppliedFilters,
): Promise<ChatResult> => {
  const payload = await httpRequest<ChatData>(`${BASE_URL}/query`, {
    method: "POST",
    body: { question, history, selection, chatFilters },
  })

  return {
    answer: payload.answer ?? "No response received.",
    appliedFilters: payload.appliedFilters ?? null,
    action: payload.action ?? null,
  }
}
