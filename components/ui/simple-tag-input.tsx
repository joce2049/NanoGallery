"use client"

import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { tags as allTags } from "@/lib/mock-data"

interface SimpleTagInputProps {
    value: string[]
    onChange: (tags: string[]) => void
}

export function SimpleTagInput({ value, onChange }: SimpleTagInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const val = e.currentTarget.value.trim()
            if (val && !value.includes(val)) {
                onChange([...value, val])
                e.currentTarget.value = ''
            }
        }
    }

    const removeTag = (tag: string) => {
        onChange(value.filter(t => t !== tag))
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(tag => (
                    <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                    </span>
                ))}
            </div>
            <Input
                placeholder="输入标签后按回车"
                onKeyDown={handleKeyDown}
                className="bg-background"
            />
            <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-muted-foreground">推荐标签:</span>
                {allTags.slice(0, 5).map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => !value.includes(t.id) && onChange([...value, t.id])}
                        className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                        {t.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
