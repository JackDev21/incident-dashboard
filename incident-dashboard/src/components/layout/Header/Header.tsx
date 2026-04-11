import { Activity, LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/context/AuthContext"
import styles from "./Header.module.scss"

export const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/incidents" className={styles.logo}>
          <div className={styles.iconWrapper}>
            <Activity size={20} />
          </div>
          <span>IncidentHub</span>
        </Link>

        {user && (
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
            <span className={styles.userName}>{user.name || "User"}</span>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
