"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useLanguage, type Language } from "@/lib/context/language-context"

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="ml-auto flex items-center gap-0.5">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={cn(
            "rounded px-2 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            language === code
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
