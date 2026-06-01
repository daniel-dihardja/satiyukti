import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Satiyukti
          </h1>
          <p className="text-lg text-muted-foreground">To be defined</p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/vidya" passHref>
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
