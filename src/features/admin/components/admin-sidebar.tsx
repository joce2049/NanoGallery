"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, Home, Sun, Moon, Plus, Tags, Activity, FolderTree, Settings, Menu } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/ui/sheet"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { cn } from "@/shared/lib/utils"
import { brandMark, uiText } from "@/config"
import { useRuntimeSettings } from "@/shared/lib/use-runtime-settings"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/ui/alert-dialog"

const navItems = [
    { label: "概览", href: "/admin", icon: LayoutDashboard },
    { label: uiText.buttons.create, href: "/admin/upload", icon: Plus },
    { label: "标签管理", href: "/admin/tags", icon: Tags },
    { label: "分类管理", href: "/admin/categories", icon: FolderTree },
    { label: "站点设置", href: "/admin/settings", icon: Settings },
    { label: "系统诊断", href: "/admin/health", icon: Activity },
]

function AdminNavContent({ onNavigate }: { onNavigate?: () => void }) {
    const settings = useRuntimeSettings()
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    useEffect(() => setMounted(true), [])

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            window.location.href = "/"
        } catch (e) {
            console.error("Logout failed", e)
        } finally {
            setLoggingOut(false)
            setShowLogoutConfirm(false)
        }
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6">
                <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", brandMark.boxClass)}>
                        <span className={cn("text-lg font-bold", brandMark.glyphClass)}>{brandMark.glyph}</span>
                    </div>
                    <span className="text-lg font-bold text-sidebar-foreground">{settings.site.adminName}</span>
                </Link>
            </div>

            <Separator className="bg-sidebar-border" />

            <nav className="flex-1 px-4 py-4">
                <div className="space-y-1 py-2">
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">管理</p>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href} onClick={onNavigate}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start",
                                        isActive
                                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                                    )}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            <div className="space-y-2 border-t border-sidebar-border p-4">
                <Link href="/" onClick={onNavigate}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50">
                        <Home className="mr-2 h-4 w-4" />
                        返回主页
                    </Button>
                </Link>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {mounted && theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    切换主题
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:bg-destructive/10"
                    onClick={() => setShowLogoutConfirm(true)}
                    disabled={loggingOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loggingOut ? "退出中..." : uiText.buttons.logout}
                </Button>
            </div>

            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{uiText.messages.confirmLogout}</AlertDialogTitle>
                        <AlertDialogDescription>{uiText.messages.adminLogoutDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{uiText.buttons.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-destructive text-white hover:bg-destructive/90">
                            {loggingOut ? "退出中..." : uiText.buttons.logout}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

/** 桌面端固定侧栏 */
export function AdminSidebar() {
    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/40 bg-sidebar lg:block">
            <AdminNavContent />
        </aside>
    )
}

/** 移动端顶栏 + 抽屉 */
export function AdminMobileBar() {
    const settings = useRuntimeSettings()
    const [open, setOpen] = useState(false)

    return (
        <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-2 border-b border-border/40 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="打开菜单">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-sidebar p-0">
                    <SheetTitle className="sr-only">{settings.site.adminName}</SheetTitle>
                    <AdminNavContent onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>
            <span className="text-base font-bold text-foreground">{settings.site.adminName}</span>
        </div>
    )
}
