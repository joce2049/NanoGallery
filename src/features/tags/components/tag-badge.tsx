"use client"

import type { Tag as TagType } from "@/core/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { MouseEvent } from "react"
import { Badge } from "@/shared/ui/badge"

const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
}

interface TagBadgeProps {
    tag: TagType
    clickable?: boolean
    size?: "sm" | "md"
}

export function TagBadge({ tag, clickable = true, size = "sm" }: TagBadgeProps) {
    const pathname = usePathname()

    const handleTagNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
        if (pathname !== "/") return

        event.preventDefault()
        window.history.pushState({}, "", `/?tag=${tag.slug}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const badgeContent = (
        <Badge
            variant="secondary"
            className={`${sizeClasses[size]} ${clickable ? "hover:bg-accent cursor-pointer" : ""}`}
            style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
        >
            {tag.name}
        </Badge>
    )

    if (clickable) {
        return (
            <Link href={`/?tag=${tag.slug}`} prefetch={false} onClick={handleTagNavigation}>
                {badgeContent}
            </Link>
        )
    }

    return badgeContent
}

interface TagListProps {
    tags: TagType[]
    limit?: number
    clickable?: boolean
    size?: "sm" | "md"
}

export function TagList({ tags, limit, clickable = true, size = "sm" }: TagListProps) {
    const displayTags = limit ? tags.slice(0, limit) : tags
    const remaining = limit && tags.length > limit ? tags.length - limit : 0

    return (
        <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} clickable={clickable} size={size} />
            ))}
            {remaining > 0 && (
                <Badge variant="outline" className={sizeClasses[size]}>
                    +{remaining}
                </Badge>
            )}
        </div>
    )
}
