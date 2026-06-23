import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { MessageCircle, X, Send, Bot, User, RotateCcw } from "lucide-react"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import type { ComponentPropsWithoutRef, ReactElement } from "react"
import { Button } from "@/components/ui/Button"
import { useChat, type ChatMessage as ChatMessageType } from "@/features/chat/hooks/useChat"
import { useTranslation } from "react-i18next"
import styles from "./ChatBubble.module.scss"

type MarkdownListProps = ComponentPropsWithoutRef<"ul">
type MarkdownListItemProps = ComponentPropsWithoutRef<"li">

const isElementWithChildren = (node: React.ReactNode): node is ReactElement<{ children?: React.ReactNode }> => {
  return typeof node === "object" && node !== null && "props" in node
}

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
            ul: (props: MarkdownListProps) => <ul className={styles.candidateList} {...props} />,
            li: (props: MarkdownListItemProps) => {
              const { children } = props

              const flattenText = (node: React.ReactNode): string => {
                if (typeof node === "string") return node
                if (Array.isArray(node)) return node.map(flattenText).join("")
                if (isElementWithChildren(node)) return flattenText(node.props.children)
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
  const { t } = useTranslation()
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
              <span>{t("chat.title")}</span>
            </div>
            <div className={styles.headerActions}>
              <Button
                variant="ghost"
                icon={<RotateCcw size={16} />}
                onClick={clearMessages}
                title={t("chat.newConversation")}
                className={styles.closeBtn}
                disabled={messages.length === 0 || isPending}
              />
              <Button
                variant="ghost"
                icon={<X size={18} />}
                onClick={() => setOpen(false)}
                title={t("chat.closeChat")}
                className={styles.closeBtn}
              />
            </div>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <p className={styles.empty}>{t("chat.emptyPrompt")}</p>
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
              placeholder={t("chat.inputPlaceholder")}
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
              title={t("chat.send")}
              className={styles.sendBtn}
            />
          </form>
        </div>
      )}

      <button
        className={`${styles.bubble} ${open ? styles.bubbleActive : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={t("chat.openAssistant")}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>,
    document.body,
  )
}
