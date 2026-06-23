import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { resources, type AppLanguage } from "./resources"

const LANGUAGE_STORAGE_KEY = "app_language"
const DEFAULT_LANGUAGE: AppLanguage = "es"

const resolveInitialLanguage = (): AppLanguage => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === "es" || stored === "en") return stored

  const browserLanguage = navigator.language.toLowerCase()
  if (browserLanguage.startsWith("es")) return "es"
  if (browserLanguage.startsWith("en")) return "en"
  return DEFAULT_LANGUAGE
}

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
})

export default i18n
