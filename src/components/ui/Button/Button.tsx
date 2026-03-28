import styles from "./Button.module.scss"

type ButtonVariant = "primary" | "secondary"
type ButtonProps = {
  label: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: ButtonVariant
}

export const Button = ({ label, onClick, disabled = false, className = "", variant = "primary" }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled} className={`${styles.button} ${styles[variant]} ${className}`}>
      {label}
    </button>
  )
}
