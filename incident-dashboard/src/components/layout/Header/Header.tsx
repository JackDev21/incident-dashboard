import { Activity } from "lucide-react"
import { Link } from "react-router-dom"
import styles from "./Header.module.scss"

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/incidents" className={styles.logo}>
          <div className={styles.iconWrapper}>
            <Activity size={20} />
          </div>
          <span>IncidentHub</span>
        </Link>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>A</div>
          <span className={styles.userName}>Admin</span>
        </div>
      </div>
    </header>
  )
}
