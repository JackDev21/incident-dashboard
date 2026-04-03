const BASE_URL = `${import.meta.env.VITE_API_URL}/chat`

type ChatApiResponse = {
  success?: boolean
  data?: { answer: string }
  message?: string
}

type HistoryMessage = { role: "user" | "assistant"; content: string }

export const queryChat = async (question: string, history: HistoryMessage[] = []): Promise<string> => {
  const response = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  })

  const payload = (await response.json()) as ChatApiResponse

  if (!response.ok) {
    throw new Error(payload.message ?? "Error querying chat")
  }

  return payload.data?.answer ?? "No response received."
}
