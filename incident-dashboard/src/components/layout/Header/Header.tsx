import { Activity, LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/context/AuthContext"
import { useTranslation } from "react-i18next"
import styles from "./Header.module.scss"

export const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

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
          <span>{t("common.appName")}</span>
        </Link>

        {user && (
          <div className={styles.userProfile}>
            <label htmlFor="language-switch" className={styles.languageLabel}>
              {t("common.language")}
            </label>
            <select
              id="language-switch"
              className={styles.languageSelect}
              value={i18n.language.startsWith("es") ? "es" : "en"}
              onChange={(e) => {
                void i18n.changeLanguage(e.target.value)
              }}
            >
              <option value="es">{t("common.spanish")}</option>
              <option value="en">{t("common.english")}</option>
            </select>
            <div className={styles.avatar}>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
            <span className={styles.userName}>{user.name || t("common.userFallback")}</span>
            <button className={styles.logoutBtn} onClick={handleLogout} title={t("common.logout")}>
              <LogOut size={16} />
              {t("common.logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
