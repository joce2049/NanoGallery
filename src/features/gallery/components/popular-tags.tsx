"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { MouseEvent } from "react"
import type { Prompt, Tag } from "@/core/types"
import { Badge } from "@/shared/ui/badge"

interface PopularTagsProps {
    prompts: Prompt[]
    tags: Tag[]
    limit?: number
    className?: string
}

export function PopularTags({ prompts, tags, limit = 12, className = "" }: PopularTagsProps) {
    const pathname = usePathname()
    const tagMap = new Map(tags.map(tag => [tag.id, tag]))
    const counts = new Map<string, number>()

    prompts.forEach(prompt => {
        prompt.tags.forEach(tagId => {
            counts.set(tagId, (counts.get(tagId) || 0) + 1)
        })
    })

    const popularTags = Array.from(counts.entries())
        .map(([tagId, count]) => {
            const tag = tagMap.get(tagId) || { id: tagId, slug: tagId, name: tagId }
            return { tag, count }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)

    if (popularTags.length === 0) return null

    const handleTagNavigation = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
        // 仅在首页做原地筛选；其他页面（如 /search）让 Link 正常跳转回首页
        if (pathname !== "/") return

        event.preventDefault()
        window.history.pushState({}, "", href)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
            <span className="text-xs text-muted-foreground">热门标签</span>
            {popularTags.map(({ tag, count }) => (
                <Link
                    key={tag.id}
                    href={`/?tag=${tag.slug}`}
                    prefetch={false}
                    onClick={(event) => handleTagNavigation(`/?tag=${tag.slug}`, event)}
                >
                    <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1 text-xs hover:bg-accent transition-colors"
                        style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                    >
                        {tag.name}
                        <span className="ml-1 text-muted-foreground">{count}</span>
                    </Badge>
                </Link>
            ))}
        </div>
    )
}
