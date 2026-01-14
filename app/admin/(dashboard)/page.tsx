
import { JSONFileDB } from "@/lib/db"
import { AdminPromptList } from "@/components/admin-prompt-list"

export default async function AdminDashboard() {
    const prompts = await JSONFileDB.getAllPrompts()
    // Sort by createdAt desc
    prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div className="space-y-6">


            <div className="grid gap-6">
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/50">
                        <h3 className="font-semibold text-foreground">所有内容 ({prompts.length})</h3>
                    </div>

                    <AdminPromptList initialPrompts={prompts} />
                </div>
            </div>
        </div>
    )
}
