import { JSONFileDB } from "@/server/db"
import { PromptForm } from "@/features/admin/components/prompt-form"
import { notFound } from "next/navigation"

interface EditPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditPage({ params }: EditPageProps) {
    const resolvedParams = await params
    const id = resolvedParams.id
    const prompt = await JSONFileDB.getPromptById(id)

    if (!prompt) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">编辑 Prompt</h1>
                <p className="text-sm text-muted-foreground mt-1">修改内容与元数据；统计数据会保留，保存后立即生效。</p>
            </div>

            <PromptForm initialData={prompt} isEditing={true} />
        </div>
    )
}
