'use client'

import { ChevronDown } from 'lucide-react'
import { useLanguage, type Language } from '@/lib/context/language-context'

const LABELS: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  id: 'Indonesia',
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="ml-auto relative flex items-center">
      <select
        value={language}
        onChange={e => setLanguage(e.target.value as Language)}
        className="appearance-none cursor-pointer rounded-md bg-muted px-3 py-1.5 pr-7 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus:outline-none"
      >
        {(Object.keys(LABELS) as Language[]).map(lang => (
          <option key={lang} value={lang}>
            {LABELS[lang]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 size-3 text-muted-foreground" />
    </div>
  )
}
