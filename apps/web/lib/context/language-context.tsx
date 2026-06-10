"use client"

import { createContext, useContext, useState, useEffect } from "react"

export type Language = "en" | "id"

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const stored = localStorage.getItem("vbt-language")
    if (stored === "en" || stored === "id") setLanguageState(stored)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("vbt-language", lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
