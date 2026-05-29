'use client'

import { cn } from '@workspace/ui/lib/utils'
import { useLanguage, type Language } from '@/lib/context/language-context'

const LABELS: Record<Language, string> = {
  en: 'EN',
  de: 'DE',
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="ml-auto flex items-center gap-0.5 rounded-md bg-muted p-0.5">
      {(['en', 'de'] as Language[]).map(lang => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            'rounded px-2.5 py-1 text-xs font-medium transition-colors',
            language === lang
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  )
}
