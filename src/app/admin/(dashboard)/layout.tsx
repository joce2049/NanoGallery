
import { isAuthenticated } from "@/server/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/features/admin/components/admin-sidebar"

// 后台必须每次请求实时鉴权，禁止预渲染/缓存，避免"未登录时的跳转"被缓存导致已登录也被弹回登录页
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const isAuth = await isAuthenticated()

    if (!isAuth) {
        redirect("/admin/login")
    }

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
