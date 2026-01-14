"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn, copyToClipboard } from "@/lib/utils"
import { Copy, Check } from "lucide-react"
import { recordCopy } from "@/lib/data-utils"

interface CopyPromptButtonProps {
    promptId: string
    content: string
    size?: "sm" | "default" | "lg"
}

export function CopyPromptButton({ promptId, content, size = "sm" }: CopyPromptButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const success = await copyToClipboard(content)
        if (success) {
            recordCopy(promptId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Button size={size} onClick={handleCopy}>
            {copied ? (
                <>
                    <Check className="h-4 w-4 mr-2" />
                    已复制
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4 mr-2" />
                    复制
                </>
            )}
        </Button>
    )
}
