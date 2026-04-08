import styles from "./Toast.module.scss"

export type ToastType = "success" | "warning" | "danger" | "info"

export type ToastItem = {
  id: number
  message: string
  type: ToastType
}

type Props = {
  toasts: ToastItem[]
}

export const Toast = ({ toasts }: Props) => {
  if (toasts.length === 0) return null

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
