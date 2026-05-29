import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components/resizable'
import { VerseSidebar } from '@/components/verse-sidebar'
import { ChatPanel } from '@/components/chat-panel'
import { getVerseGroups } from '@/lib/data/verses'

export default function VidyaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const groups = getVerseGroups()

  return (
    <SidebarProvider>
      <VerseSidebar groups={groups} />
      <SidebarInset className="min-h-0 flex-1">
        <header className="flex h-10 shrink-0 items-center border-b px-3">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize="40%" minSize="25%" maxSize="65%">
              <div className="h-full overflow-y-auto">
                {children}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="60%" minSize="35%" maxSize="75%">
              <ChatPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
