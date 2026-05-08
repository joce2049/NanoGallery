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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">编辑 Prompt</h1>
            </div>

            <PromptForm initialData={prompt} isEditing={true} />
        </div>
    )
}
