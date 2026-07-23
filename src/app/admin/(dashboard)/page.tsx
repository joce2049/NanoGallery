import Link from "next/link"
import { Plus } from "lucide-react"
import { JSONFileDB } from "@/server/db"
import { Button } from "@/shared/ui/button"
import { AdminPanel } from "@/features/admin/components/admin-panel"
import { AdminPromptList } from "@/features/admin/components/admin-prompt-list"
import { ImportExportButtons } from "@/features/admin/components/import-export-buttons"
import { uiText } from "@/config"

export default async function AdminDashboard() {
    // 加载正文，使后台列表能显示预览并支持按正文搜索
    const prompts = await JSONFileDB.getAllPrompts({ includeContent: true })
    // Sort by updatedAt desc (latest modified first)
    prompts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt).getTime()
        return dateB - dateA
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">概览</h1>
                    <p className="mt-1 text-sm text-muted-foreground">共 {prompts.length} 个 Prompt</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ImportExportButtons />
                    <Link href="/admin/upload">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {uiText.buttons.create}
                        </Button>
                    </Link>
                </div>
            </div>

            <AdminPanel flush>
                <AdminPromptList initialPrompts={prompts} />
            </AdminPanel>
        </div>
    )
}
