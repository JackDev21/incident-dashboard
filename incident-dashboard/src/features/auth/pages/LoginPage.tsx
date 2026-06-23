import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import styles from "./LoginPage.module.scss"

export const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
      navigate("/incidents")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("auth.loginError")
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>{t("auth.loginTitle")}</h1>
        <p className={styles.subtitle}>{t("auth.loginSubtitle")}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">{t("auth.email")}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t("auth.emailPlaceholder")}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">{t("auth.password")}</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("auth.passwordPlaceholder")}
              />
              <div className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#718096" }}>
          {t("auth.noAccount")}{" "}
          <Link to="/register" style={{ color: "#3182ce", textDecoration: "none", fontWeight: "600" }}>
            {t("auth.registerHere")}
          </Link>
        </div>
      </div>
    </div>
  )
}
