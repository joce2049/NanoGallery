"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LogOut, Home, Sun, Moon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { siteConfig } from "@/lib/config"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

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
        <aside className="w-64 border-r border-border bg-sidebar flex flex-col fixed h-full">
            <div className="p-6 border-b border-sidebar-border flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="font-bold text-white text-xl">N</span>
                </div>
                <span className="font-bold text-sidebar-foreground text-lg">{siteConfig.admin.name}</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === "/admin"
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                        }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>概览</span>
                </Link>
                <Link
                    href="/admin/upload"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === "/admin/upload"
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                        }`}
                >
                    <Plus className="w-5 h-5" />
                    <span>新建 Prompt</span>
                </Link>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-sidebar-border space-y-2">
                <Link href="/">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        返回主页
                    </Button>
                </Link>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
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
                    onClick={() => setShowLogoutConfirm(true)}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                </Button>
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
