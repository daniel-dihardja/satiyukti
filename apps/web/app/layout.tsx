import type { Metadata, Viewport } from "next"
import { Lato, Cormorant_Garamond } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#241a13" },
  ],
}

export const metadata: Metadata = {
  title: "Satiyukti — Ancient Scriptures, Modern Exploration",
  description:
    "Explore the Vijñāna Bhairava Tantra — 112 ancient meditation techniques from Kashmir Shaivism. One of humanity's oldest maps of consciousness, now accessible in a modern interface.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Satiyukti",
  },
  formatDetection: { telephone: false },
}

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sans",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
})

const isPublished = process.env.PUBLISH !== "0"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", lato.variable, cormorant.variable)}
    >
      <body>
        {isPublished ? <ThemeProvider>{children}</ThemeProvider> : null}
      </body>
      {isPublished && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  )
}
