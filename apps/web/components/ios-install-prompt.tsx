"use client"

import { useState } from "react"
import { Share, Plus } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import { useIsIOSSafari } from "@/hooks/use-pwa-install"

export function IOSInstallPrompt() {
  const isIOSSafari = useIsIOSSafari()
  const [open, setOpen] = useState(false)

  if (!isIOSSafari) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full px-2 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Add to Home Screen
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-2">
            <SheetTitle>Add to Home Screen</SheetTitle>
            <SheetDescription>
              Follow these steps in Safari to install Satiyukti
            </SheetDescription>
          </SheetHeader>

          <ol className="space-y-4 px-4 pt-2 pb-6">
            <li className="flex items-start gap-4">
              <StepNumber>1</StepNumber>
              <p className="flex-1 pt-1 text-sm text-foreground">
                Tap the <Chip icon={<Share className="h-3 w-3" />}>Share</Chip>{" "}
                button at the bottom of Safari
              </p>
            </li>
            <li className="flex items-start gap-4">
              <StepNumber>2</StepNumber>
              <p className="flex-1 pt-1 text-sm text-foreground">
                Scroll down and tap{" "}
                <Chip icon={<Plus className="h-3 w-3" />}>
                  Add to Home Screen
                </Chip>
              </p>
            </li>
            <li className="flex items-start gap-4">
              <StepNumber>3</StepNumber>
              <p className="flex-1 pt-1 text-sm text-foreground">
                Tap <strong>Add</strong> in the top-right corner to confirm
              </p>
            </li>
          </ol>
        </SheetContent>
      </Sheet>
    </>
  )
}

function StepNumber({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/40 bg-foreground/5">
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

function Chip({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-xs font-medium">
      {icon}
      {children}
    </span>
  )
}
