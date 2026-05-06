"use client"

import type { Tag as TagType } from "@/lib/types"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

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
        return <Link href={`/?tag=${tag.slug}`}>{badgeContent}</Link>
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
