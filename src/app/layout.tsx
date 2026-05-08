import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { LayoutWrapper } from "@/features/shell/components/layout-wrapper"
import { Toaster } from "@/shared/ui/sonner"
import { getRuntimeSettings } from "@/server/settings"
import "./globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getRuntimeSettings()

  return {
    title: settings.site.metadataTitle,
    description: settings.site.metadataDescription,
    generator: "Nano Gallery",
    icons: {
      icon: [
        {
          url: "/icon-light-32x32.png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/icon-dark-32x32.png",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      apple: "/apple-icon.png",
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isAuthenticated } = await import("@/server/auth") // Dynamic import to avoid build issues if any
  const [isLoggedIn, settings] = await Promise.all([
    isAuthenticated(),
    getRuntimeSettings(),
  ])

  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LayoutWrapper isLoggedIn={isLoggedIn} siteName={settings.site.name}>
            {children}
          </LayoutWrapper>
          <Toaster position="top-center" closeButton />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
