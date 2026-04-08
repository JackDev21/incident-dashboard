import { createContext, useCallback, useRef, useState } from "react"
import { Toast } from "@/components/ui/Toast"
import type { ToastItem, ToastType } from "@/components/ui/Toast"

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++counterRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toasts={toasts} />
    </ToastContext.Provider>
  )
}
