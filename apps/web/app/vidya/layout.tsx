import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import { VerseSidebar } from '@/components/verse-sidebar'
import { getVerseGroups } from '@/lib/data/verses'

export default function VidyaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const groups = getVerseGroups()

  return (
    <SidebarProvider>
      <VerseSidebar groups={groups} />
      <SidebarInset className="min-h-0 flex-1">
        <header className="flex h-12 shrink-0 items-center border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
