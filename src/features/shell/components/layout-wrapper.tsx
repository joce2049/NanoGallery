"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/features/shell/components/sidebar"
import { MobileSidebar } from "@/features/shell/components/mobile-sidebar"
import { ThemeToggle } from "@/features/shell/components/theme-toggle"

interface LayoutWrapperProps {
    children: React.ReactNode
    isLoggedIn: boolean
    siteName: string
}

export function LayoutWrapper({ children, isLoggedIn, siteName }: LayoutWrapperProps) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith("/admin")

    if (isAdmin) {
        return <>{children}</>
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar isLoggedIn={isLoggedIn} siteName={siteName} />
            </div>

            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
                <MobileSidebar isLoggedIn={isLoggedIn} siteName={siteName} />
                <ThemeToggle />
            </div>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                {children}
            </main>
        </>
    )
}
