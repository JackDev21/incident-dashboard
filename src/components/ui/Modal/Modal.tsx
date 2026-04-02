import { useEffect } from "react"
import { createPortal } from "react-dom"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import styles from "./Modal.module.scss"

type ConfirmModalProps = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmModal = ({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onCancel])

  return createPortal(
    <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Trash2 size={20} />
          </div>
          <div className={styles.text}>
            <p className={styles.title}>{title}</p>
            <p className={styles.description}>{description}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button label={cancelLabel} variant="secondary" onClick={onCancel} />
          <Button label={confirmLabel} variant="danger" onClick={onConfirm} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
