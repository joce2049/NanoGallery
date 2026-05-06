
"use client"

import { PromptForm } from "@/components/admin/prompt-form"

export default function UploadPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">上传新 Prompt</h1>
            </div>

            <PromptForm />
        </div>
    )
}
