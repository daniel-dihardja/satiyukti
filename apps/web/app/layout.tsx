import type { Metadata, Viewport } from "next"
import { Lato, Cormorant_Garamond } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0a0a0a",
}

export const metadata: Metadata = {
  title: "Satiyukti",
  description: "112 Doorways to Pure Awareness — Vijñāna Bhairava Tantra",
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  )
}
