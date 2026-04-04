const BASE_URL = `${import.meta.env.VITE_API_URL}/chat`

type AppliedFilters = {
  status?: string
  priority?: string
  assignee?: string
  fromDate?: string
  toDate?: string
} | null

type ChatApiResponse = {
  success?: boolean
  data?: { answer: string; appliedFilters: AppliedFilters }
  message?: string
}

type HistoryMessage = { role: "user" | "assistant"; content: string }

export type ChatResult = { answer: string; appliedFilters: AppliedFilters }

export const queryChat = async (question: string, history: HistoryMessage[] = []): Promise<ChatResult> => {
  const response = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  })

  const payload = (await response.json()) as ChatApiResponse

  if (!response.ok) {
    throw new Error(payload.message ?? "Error querying chat")
  }

  return {
    answer: payload.data?.answer ?? "No response received.",
    appliedFilters: payload.data?.appliedFilters ?? null,
  }
}
