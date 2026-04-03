import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { queryChat } from "../services/chat.service"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (question: string) => queryChat(question, messages),
    onMutate: (question: string) => {
      setMessages((prev) => [...prev, { role: "user", content: question }])
    },
    onSuccess: (answer: string) => {
      setMessages((prev) => [...prev, { role: "assistant", content: answer }])
    },
    onError: (error: Error) => {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message}` }])
    },
  })

  return { messages, sendMessage, isPending }
}
