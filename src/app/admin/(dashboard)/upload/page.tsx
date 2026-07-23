
"use client"

import { PromptForm } from "@/features/admin/components/prompt-form"

export default function UploadPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">上传新 Prompt</h1>
                <p className="text-sm text-muted-foreground mt-1">填写标题、描述与 Prompt 正文，选择图片后可存草稿或直接发布。</p>
            </div>

            <PromptForm />
        </div>
    )
}
