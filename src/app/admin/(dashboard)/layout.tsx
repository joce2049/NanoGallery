
import { isAuthenticated } from "@/server/auth"
import { redirect } from "next/navigation"
import { AdminSidebar, AdminMobileBar } from "@/features/admin/components/admin-sidebar"

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
        <div className="min-h-screen bg-background text-foreground">
            {/* Sidebar（桌面固定，移动端顶栏抽屉） */}
            <AdminSidebar />
            <AdminMobileBar />

            {/* Main Content：移动端顶部留出固定顶栏(h-14)高度，桌面端正常内边距 */}
            <main className="lg:ml-64 px-4 pb-6 pt-[4.5rem] md:px-6 md:pb-8 lg:px-8 lg:pb-8 lg:pt-8">
                {children}
            </main>
        </div>
    )
}
