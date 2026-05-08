"use client"

import { ImageCard } from "@/features/gallery/components/image-card"
import type { Prompt } from "@/core/types"

interface SearchResultCardProps {
    prompt: Prompt
    query: string
}

function highlightText(text: string, query: string) {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return text

    const index = text.toLowerCase().indexOf(trimmedQuery.toLowerCase())
    if (index < 0) return text

    return (
        <>
            {text.slice(0, index)}
            <mark className="rounded bg-cyan-100 px-0.5 text-slate-950 dark:bg-cyan-200">
                {text.slice(index, index + trimmedQuery.length)}
            </mark>
            {text.slice(index + trimmedQuery.length)}
        </>
    )
}

export function SearchResultCard({ prompt, query }: SearchResultCardProps) {
    return (
        <div className="masonry-item break-inside-avoid mb-3">
            <ImageCard prompt={prompt} />
            <div className="mt-2 space-y-1 px-1">
                <h3 className="text-sm font-medium leading-snug">{highlightText(prompt.title, query)}</h3>
                {prompt.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {highlightText(prompt.description, query)}
                    </p>
                )}
            </div>
        </div>
    )
}
