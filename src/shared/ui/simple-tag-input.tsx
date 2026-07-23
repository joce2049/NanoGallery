"use client"

import { Input } from "@/shared/ui/input"
import { RefreshCw, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { Tag } from "@/core/types"
import { adminUi } from "@/config"

interface SimpleTagInputProps {
    value: string[]
    onChange: (tags: string[]) => void
}

export function SimpleTagInput({ value, onChange }: SimpleTagInputProps) {
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [tagPage, setTagPage] = useState(0)
    const visibleTagCount = adminUi.tagSuggestionLimit

    useEffect(() => {
        fetch("/api/tags")
            .then(res => res.ok ? res.json() : [])
            .then((data: Tag[]) => setAllTags(data))
            .catch(() => setAllTags([]))
    }, [])

    const tagNameMap = useMemo(() => {
        return new Map(allTags.map(tag => [tag.id, tag.name]))
    }, [allTags])

    const recommendedTags = useMemo(() => {
        if (allTags.length <= visibleTagCount) return allTags

        const decorated = allTags.map((tag, index) => {
            const seed = `${tagPage}-${tag.id}-${index}`
            let score = 0
            for (let i = 0; i < seed.length; i += 1) {
                score = (score * 31 + seed.charCodeAt(i)) % 1000003
            }
            return { tag, score }
        })

        return decorated
            .sort((a, b) => a.score - b.score)
            .slice(0, visibleTagCount)
            .map(item => item.tag)
    }, [allTags, tagPage])

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
                        {tagNameMap.get(tag) || tag}
                        <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                    </span>
                ))}
            </div>
            <Input
                placeholder="输入标签后按回车"
                onKeyDown={handleKeyDown}
                className="bg-background"
            />
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">推荐标签</span>
                    <button
                        type="button"
                        onClick={() => setTagPage(page => page + 1)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        刷新
                    </button>
                </div>
                <div className="flex min-h-[168px] max-h-[220px] flex-wrap content-start gap-2 overflow-y-auto pr-1">
                    {recommendedTags.map(t => {
                        const selected = value.includes(t.id)

                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => !selected && onChange([...value, t.id])}
                                className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${selected
                                    ? "bg-primary/15 text-primary"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {t.name}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
