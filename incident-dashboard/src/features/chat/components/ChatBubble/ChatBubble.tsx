import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { MessageCircle, X, Send, Bot, User, RotateCcw } from "lucide-react"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/Button"
import { useChat, type ChatMessage as ChatMessageType } from "@/features/chat/hooks/useChat"
import styles from "./ChatBubble.module.scss"

type ChatMessageProps = {
  role: ChatMessageType["role"]
  children: React.ReactNode
  onSelect?: (text: string) => void
}

const ChatMessage = ({ role, children, onSelect }: ChatMessageProps) => (
  <div className={`${styles.message} ${styles[role]}`}>
    <span className={styles.avatar}>{role === "user" ? <User size={14} /> : <Bot size={14} />}</span>
    <div className={styles.content}>
      {typeof children === "string" ? (
        <ReactMarkdown
          components={{
            a: ({ href, children }) => {
              if (href?.startsWith("/")) {
                return <Link to={href}>{children}</Link>
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              )
            },
            // Render lists and items: make candidate lists look like full-width buttons
            ul: (props: any) => <ul className={styles.candidateList} {...props} />,
            li: (props: any) => {
              const { children } = props

              const flattenText = (node: React.ReactNode): string => {
                if (typeof node === "string") return node
                if (Array.isArray(node)) return node.map(flattenText).join("")
                if (typeof node === "object" && node !== null && "props" in node) return flattenText((node as any).props.children)
                return ""
              }

              const text = flattenText(children).trim()

              if (role === "assistant" && onSelect && text) {
                return (
                  <li className={styles.candidateItem} {...props}>
                    <Button variant="ghost" type="button" onClick={() => onSelect(text)} className={styles.candidateBtn}>
                      <div className={styles.candidateText}>{children}</div>
                    </Button>
                  </li>
                )
              }

              return <li {...props}>{children}</li>
            },
          }}
        >
          {children}
        </ReactMarkdown>
      ) : (
        children
      )}
    </div>
  </div>
)

export const ChatBubble = () => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const { messages, sendMessage, isPending, clearMessages } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
      if (!question || isPending) return
      setInput("")
      sendMessage({ question })
  }

  return createPortal(
    <div className={styles.wrapper}>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Bot size={18} />
              <span>Incident Assistant</span>
            </div>
            <div className={styles.headerActions}>
              <Button
                variant="ghost"
                icon={<RotateCcw size={16} />}
                onClick={clearMessages}
                title="New conversation"
                className={styles.closeBtn}
                disabled={messages.length === 0 || isPending}
              />
              <Button
                variant="ghost"
                icon={<X size={18} />}
                onClick={() => setOpen(false)}
                title="Close chat"
                className={styles.closeBtn}
              />
            </div>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <p className={styles.empty}>Ask me about your incidents — status, assignees, priorities…</p>
            )}
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  onSelect={(text) => !isPending && sendMessage({ question: text, selection: { field: "assignee", value: text } })}
                >
                  {msg.content}
                </ChatMessage>
              ))}
            {isPending && (
              <ChatMessage role="assistant">
                <span className={styles.typing}>
                  <span />
                  <span />
                  <span />
                </span>
              </ChatMessage>
            )}
            <div ref={bottomRef} />
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isPending}
              autoFocus
            />
            <Button
              variant="primary"
              type="submit"
              icon={<Send size={16} />}
              disabled={!input.trim() || isPending}
              title="Send"
              className={styles.sendBtn}
            />
          </form>
        </div>
      )}

      <button
        className={`${styles.bubble} ${open ? styles.bubbleActive : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>,
    document.body,
  )
}
