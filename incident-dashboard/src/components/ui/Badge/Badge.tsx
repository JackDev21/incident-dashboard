import styles from "@/components/ui/Badge/Badge.module.scss"

type BadgeVariant = "neutral" | "success" | "warning" | "danger"

type BadgeProps = {
  label: string
  variant?: BadgeVariant
  className?: string
}

export const Badge = ({ label, variant = "neutral", className = "" }: BadgeProps) => {
  return <span className={`${styles.badge} ${styles[variant]} ${className}`}>{label}</span>
}
