"use client"

import { Eye, Copy as CopyIcon, Heart } from "lucide-react"

interface StatsBadgeProps {
    views?: number
    copies?: number
    likes?: number
    showLabel?: boolean
    className?: string
}

export function StatsBadge({ views, copies, likes, showLabel = false, className = "" }: StatsBadgeProps) {
    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return `${(num / 10000).toFixed(1)}w`
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`
        }
        return num.toString()
    }

    return (
        <div className={`flex items-center gap-3 text-sm ${className}`}>
            {views !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{formatNumber(views)}</span>
                    {showLabel && <span className="hidden sm:inline">浏览</span>}
                </div>
            )}
            {copies !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>{formatNumber(copies)}</span>
                    {showLabel && <span className="hidden sm:inline">复制</span>}
                </div>
            )}
            {likes !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-3.5 w-3.5" />
                    <span>{formatNumber(likes)}</span>
                    {showLabel && <span className="hidden sm:inline">点赞</span>}
                </div>
            )}
        </div>
    )
}
