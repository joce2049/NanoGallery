"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/config"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Sparkles, Search, TrendingUp, Calendar, ChevronDown, Wand2, User } from "lucide-react"
import { getAllCategories } from "@/lib/data-utils"
import { useState, Suspense } from "react"
import { cn } from "@/lib/utils"

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

interface MobileSidebarProps {
    isLoggedIn?: boolean
}

function MobileSidebarContent({ isLoggedIn = false }: MobileSidebarProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [categoriesExpanded, setCategoriesExpanded] = useState(true)
    const [loginOpen, setLoginOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const categories = getAllCategories()
    const currentCategory = searchParams.get("category")

    const isActive = (path: string) => pathname === path

    const navItems = [
        { label: "全部", href: "/", icon: Sparkles },
        { label: "今日最佳", href: "/top?period=today", icon: TrendingUp },
        { label: "本周最佳", href: "/top?period=week", icon: Calendar },
        { label: "本月最佳", href: "/top?period=month", icon: Calendar },
    ]

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            window.location.href = "/"
            setOpen(false) // Close sidebar after logout
        } catch (e) {
            console.error("Logout failed", e)
        } finally {
            setLoggingOut(false)
            setShowLogoutConfirm(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                    <SheetTitle className="sr-only">Nano Gallery</SheetTitle>
                    {/* Logo */}
                    <div className="flex h-16 items-center px-6">
                        <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">{siteConfig.name}</span>
                        </Link>
                    </div>

                    <Separator />

                    {/* Search Button */}
                    <div className="px-4 py-4">
                        <Link href="/search" onClick={() => setOpen(false)}>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-muted-foreground hover:text-foreground"
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
                                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                        <Button
                                            variant={isActive(item.href) ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start",
                                                isActive(item.href)
                                                    ? "bg-accent text-accent-foreground font-medium"
                                                    : "hover:bg-accent/50"
                                            )}
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </div>

                        <Separator className="my-4" />

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
                                            <Link key={category.id} href={`/?category=${category.slug}`} onClick={() => setOpen(false)}>
                                                <Button
                                                    variant={isSelected ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className={cn(
                                                        "w-full justify-start text-sm",
                                                        isSelected
                                                            ? "bg-accent text-accent-foreground"
                                                            : "hover:bg-accent/50"
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
                    <div className="border-t p-4 space-y-2">

                        {isLoggedIn ? (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                                size="sm"
                                onClick={() => setShowLogoutConfirm(true)}
                                disabled={loggingOut}
                            >
                                <User className="mr-2 h-4 w-4" />
                                {loggingOut ? "退出中..." : "退出登录"}
                            </Button>
                        ) : (
                            <Link href="/admin" onClick={() => setOpen(false)}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    size="sm"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    登录
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </SheetContent>
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
        </Sheet>
    )
}

export function MobileSidebar({ isLoggedIn }: MobileSidebarProps) {
    return (
        <Suspense fallback={
            <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5 opacity-50" />
            </Button>
        }>
            <MobileSidebarContent isLoggedIn={isLoggedIn} />
        </Suspense>
    )
}
