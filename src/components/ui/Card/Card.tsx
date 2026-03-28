import type { ReactNode } from "react"

import styles from "@/components/ui/Card/Card.module.scss"

type CardProps = {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className = "" }: CardProps) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>
}
