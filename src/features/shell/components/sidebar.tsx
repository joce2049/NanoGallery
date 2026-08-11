"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Sparkles, Search, ChevronDown, User, Sun, Moon, LayoutDashboard } from "lucide-react"
import { getAllCategories } from "@/core/data-utils"
import { useState, Suspense, useEffect, type MouseEvent } from "react"
import { cn } from "@/shared/lib/utils"
import { useTheme } from "next-themes"
import type { Category } from "@/core/types"

import { LoginModal } from "@/features/auth/components/login-modal"

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

interface SidebarProps {
    isLoggedIn?: boolean
    siteName: string
    initialCategories?: Category[]
}

function SidebarContent({ isLoggedIn = false, siteName, initialCategories }: SidebarProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { theme, setTheme } = useTheme()
    const [categoriesExpanded, setCategoriesExpanded] = useState(true)
    const [loginOpen, setLoginOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [rawCategories, setRawCategories] = useState<Category[]>(initialCategories ?? [])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        // 服务端已下发分类时无需再次请求，避免与移动端侧边栏重复拉取
        if (initialCategories) return
        fetch("/api/categories")
            .then(res => res.ok ? res.json() : [])
            .then((data: Category[]) => setRawCategories(data))
            .catch(() => setRawCategories([]))
    }, [initialCategories])

    const categories = getAllCategories(rawCategories)
    const currentCategory = searchParams.get("category")

    const isActive = (href: string) => {
        if (href === "/" && pathname === "/") {
            return !searchParams.get("category") && !searchParams.get("tag")
        }
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
    ]

    const handleHomeFilterNavigation = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
        if (pathname !== "/") return

        event.preventDefault()
        window.history.pushState({}, "", href)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

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
                    <Link
                        href="/"
                        prefetch={false}
                        className="flex items-center space-x-2"
                        onClick={(event) => handleHomeFilterNavigation("/", event)}
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white via-slate-200 to-cyan-100 shadow-sm ring-1 ring-slate-300/70 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-slate-900" />
                        </div>
                        <span className="font-bold text-lg text-sidebar-foreground">{siteName}</span>
                    </Link>
                </div>

                <Separator className="bg-sidebar-border" />

                {/* Search Button */}
                <div className="px-4 py-4">
                    <Link href="/search">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-muted-foreground hover:text-foreground border-sidebar-border hover:bg-sidebar-accent shadow-none"
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
                            导航
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={false}
                                    onClick={(event) => handleHomeFilterNavigation(item.href, event)}
                                >
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
                                        <Link
                                            key={category.id}
                                            href={`/?category=${category.slug}`}
                                            prefetch={false}
                                            onClick={(event) => handleHomeFilterNavigation(`/?category=${category.slug}`, event)}
                                        >
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
                    {isLoggedIn && (
                        <Link href="/admin">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                                size="sm"
                            >
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                进入后台
                            </Button>
                        </Link>
                    )}

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
                        size="sm"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {/* 同上：两枚图标同格交叉切换，避免条件渲染换元素导致过渡失效 */}
                        <span className="t-icon-swap mr-2" data-state={mounted && theme === "dark" ? "b" : "a"}>
                            <Moon data-icon="a" className="t-icon h-4 w-4" />
                            <Sun data-icon="b" className="t-icon h-4 w-4" />
                        </span>
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
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sidebar-foreground"
                            size="sm"
                            onClick={() => setLoginOpen(true)}
                        >
                            <User className="mr-2 h-4 w-4" />
                            登录
                        </Button>
                    )}
                </div>
            </div>
            <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
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
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            退出登录
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    )
}

export function Sidebar({ isLoggedIn, siteName, initialCategories }: SidebarProps) {
    return (
        <Suspense fallback={<div className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar" />}>
            <SidebarContent isLoggedIn={isLoggedIn} siteName={siteName} initialCategories={initialCategories} />
        </Suspense>
    )
}
