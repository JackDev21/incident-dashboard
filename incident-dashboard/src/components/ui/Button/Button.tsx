import React from "react"
import styles from "@/components/ui/Button/Button.module.scss"

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon"
type ButtonProps = {
  label?: string
  icon?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
  variant?: ButtonVariant
  title?: string
}

export const Button = ({
  label,
  icon,
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
  title,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${variant === "icon" ? styles.iconButton : styles[variant]} ${className}`}
      title={title}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  )
}
