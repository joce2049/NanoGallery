"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Search, TrendingUp, Calendar, ChevronDown, Wand2, User, Sun, Moon } from "lucide-react"
import { getAllCategories } from "@/lib/data-utils"
import { useState, Suspense, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { siteConfig } from "@/lib/config"

// import { LoginModal } from "@/components/auth/login-modal"

import { useRouter } from "next/navigation"

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

interface SidebarProps {
    isLoggedIn?: boolean
}

function SidebarContent({ isLoggedIn = false }: SidebarProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [categoriesExpanded, setCategoriesExpanded] = useState(true)
    const [loginOpen, setLoginOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const categories = getAllCategories()
    const currentCategory = searchParams.get("category")

    const isActive = (href: string) => {
        if (href === "/" && pathname === "/") return true
        if (href === "/" && pathname !== "/") return false

        if (href.includes("?")) {
            const [path, query] = href.split("?")
            if (pathname !== path) return false

            const params = new URLSearchParams(query)
            const period = params.get("period")
            return searchParams.get("period") === period
        }

        return pathname === href
    }

    const navItems = [
        { label: "全部", href: "/", icon: Sparkles },
        { label: "今日", href: "/top?period=today", icon: TrendingUp },
        { label: "本周", href: "/top?period=week", icon: Calendar },
        { label: "本月", href: "/top?period=month", icon: Calendar },
    ]

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
                {/* Logo */}
                <div className="flex h-16 items-center px-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-sidebar-foreground">{siteConfig.name}</span>
                    </Link>
                </div>

                <Separator className="bg-sidebar-border" />

                {/* Search Button */}
                <div className="px-4 py-4">
                    <Link href="/search">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-muted-foreground hover:text-foreground border-sidebar-border hover:bg-sidebar-accent"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            搜索...
                        </Button>
                    </Link>
                </div>

                <ScrollArea className="flex-1 px-4">
                    {/* Navigation */}
                    <div className="space-y-1 py-2">
                        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            排行
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive(item.href) ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            isActive(item.href)
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

                    <Separator className="my-4 bg-sidebar-border" />

                    {/* Categories */}
                    <div className="py-2">
                        <button
                            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                            className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                        >
                            <span>分类</span>
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    categoriesExpanded ? "transform rotate-180" : ""
                                )}
                            />
                        </button>
                        {categoriesExpanded && (
                            <div className="mt-2 space-y-1">
                                {categories.map((category) => {
                                    const isSelected = currentCategory === category.slug
                                    return (
                                        <Link key={category.id} href={`/?category=${category.slug}`}>
                                            <Button
                                                variant={isSelected ? "secondary" : "ghost"}
                                                size="sm"
                                                className={cn(
                                                    "w-full justify-start text-sm",
                                                    isSelected
                                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                                )}
                                            >
                                                {category.name}
                                            </Button>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Bottom Actions */}
                <div className="border-t border-sidebar-border p-4 space-y-2">
                    {/* Theme Toggle */}
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

                    {isLoggedIn ? (
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            size="sm"
                            onClick={() => setShowLogoutConfirm(true)}
                            disabled={loggingOut}
                        >
                            <User className="mr-2 h-4 w-4" />
                            {loggingOut ? "退出中..." : "退出登录"}
                        </Button>
                    ) : (
                        <Link href="/admin">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sidebar-foreground"
                                size="sm"
                            >
                                <User className="mr-2 h-4 w-4" />
                                登录
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            {/* Removed LoginModal */}
            {/* <LoginModal open={loginOpen} onOpenChange={setLoginOpen} /> */}

            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确定要退出登录吗？</AlertDialogTitle>
                        <AlertDialogDescription>
                            您将退出当前账户。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            退出登录
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    )
}

export function Sidebar({ isLoggedIn }: SidebarProps) {
    return (
        <Suspense fallback={<div className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar" />}>
            <SidebarContent isLoggedIn={isLoggedIn} />
        </Suspense>
    )
}
