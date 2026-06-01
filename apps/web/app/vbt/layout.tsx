import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { VerseSidebar } from "@/components/verse-sidebar"
import { LanguageProvider } from "@/lib/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { getVerseGroups } from "@/lib/data/verses"

export default function VidyaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const groups = getVerseGroups()

  return (
    <LanguageProvider>
      <SidebarProvider>
        <VerseSidebar groups={groups} />
        <SidebarInset className="min-h-0 flex-1">
          <header className="sticky top-0 z-10 shrink-0 border-b bg-background">
            <div style={{ height: "env(safe-area-inset-top)" }} />
            <div className="flex h-12 items-center px-4">
              <SidebarTrigger className="-ml-1" />
              <LanguageSelector />
            </div>
          </header>
          <div className="h-full overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </LanguageProvider>
  )
}
