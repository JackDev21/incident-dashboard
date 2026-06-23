import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import styles from "./RegisterPage.module.scss"

export const RegisterPage = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await register(name, email, password)
      navigate("/incidents")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("auth.registerError")
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <h1 className={styles.title}>{t("auth.registerTitle")}</h1>
        <p className={styles.subtitle}>{t("auth.registerSubtitle")}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{t("auth.fullName")}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("auth.fullNamePlaceholder")}
            />
          </div>

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
            {isLoading ? t("auth.registering") : t("auth.registerButton")}
          </button>
        </form>

        <div className={styles.footer}>
          {t("auth.alreadyAccount")} {" "}
          <Link to="/login" className={styles.link}>
            {t("auth.loginLink")}
          </Link>
        </div>
      </div>
    </div>
  )
}
