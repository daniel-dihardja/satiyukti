import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import { VerseSidebar } from '@/components/verse-sidebar'
import { LanguageProvider } from '@/lib/context/language-context'
import { LanguageSelector } from '@/components/language-selector'
import { getVerseGroups, allVersesDe, allVersesId } from '@/lib/data/verses'

export default function VidyaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const groups = getVerseGroups()
  const groupsDe = getVerseGroups(allVersesDe)
  const groupsId = getVerseGroups(allVersesId)

  return (
    <LanguageProvider>
      <SidebarProvider>
        <VerseSidebar groups={groups} groupsDe={groupsDe} groupsId={groupsId} />
        <SidebarInset className="min-h-0 flex-1">
          <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <LanguageSelector />
          </header>
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </LanguageProvider>
  )
}
