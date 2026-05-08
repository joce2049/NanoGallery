"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, Home, Sun, Moon, Plus, Tags, Activity, FolderTree, Settings } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { cn } from "@/shared/lib/utils"
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

export function AdminSidebar() {
    const settings = useRuntimeSettings()
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    const navItems = [
        { label: "概览", href: "/admin", icon: LayoutDashboard },
        { label: "新建 Prompt", href: "/admin/upload", icon: Plus },
        { label: "标签管理", href: "/admin/tags", icon: Tags },
        { label: "分类管理", href: "/admin/categories", icon: FolderTree },
        { label: "站点设置", href: "/admin/settings", icon: Settings },
        { label: "系统诊断", href: "/admin/health", icon: Activity },
    ]

    useEffect(() => {
        setMounted(true)
    }, [])

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
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar">
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center px-6">
                    <Link href="/admin" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white via-slate-200 to-cyan-100 shadow-sm ring-1 ring-slate-300/70 flex items-center justify-center">
                            <span className="font-bold text-slate-900 text-lg">N</span>
                        </div>
                        <span className="font-bold text-sidebar-foreground text-lg">{settings.site.adminName}</span>
                    </Link>
                </div>

                <Separator className="bg-sidebar-border" />

                <nav className="flex-1 px-4 py-4">
                    <div className="space-y-1 py-2">
                        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            管理
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            isActive
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
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

                {/* Bottom Actions */}
                <div className="border-t border-sidebar-border p-4 space-y-2">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                            size="sm"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            返回主页
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                        size="sm"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {mounted && theme === "dark" ? (
                            <Sun className="mr-2 h-4 w-4" />
                        ) : (
                            <Moon className="mr-2 h-4 w-4" />
                        )}
                        切换主题
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        size="sm"
                        onClick={() => setShowLogoutConfirm(true)}
                        disabled={loggingOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {loggingOut ? "退出中..." : "退出登录"}
                    </Button>
                </div>
            </div>

            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确定要退出登录吗？</AlertDialogTitle>
                        <AlertDialogDescription>
                            您将退出管理后台。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            {loggingOut ? "退出中..." : "退出登录"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    )
}
