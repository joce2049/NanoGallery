"use client"

import * as React from "react"
import { Eye, Copy as CopyIcon, Heart } from "lucide-react"

import { replayAnimation } from "@/shared/lib/motion"

interface StatsBadgeProps {
    views?: number
    copies?: number
    likes?: number
    showLabel?: boolean
    className?: string
}

function formatNumber(num: number) {
    if (num >= 10000) {
        return `${(num / 10000).toFixed(1)}w`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
}

/**
 * 数字弹入（transitions.dev · number pop-in）。
 *
 * 数值变化时逐字符从下方带模糊回弹进场，错峰步长一档 --duration-stagger。首次渲染
 * 不播——否则每次开弹窗整排统计会一起抖。
 */
function AnimatedNumber({ value }: { value: number }) {
    const text = formatNumber(value)
    const groupRef = React.useRef<HTMLSpanElement>(null)
    const renderedText = React.useRef(text)

    React.useEffect(() => {
        if (renderedText.current === text) return
        renderedText.current = text
        replayAnimation(groupRef.current, "is-animating")
    }, [text])

    return (
        <span ref={groupRef} className="t-digit-group">
            {text.split("").map((char, index) => (
                <span
                    key={`${index}-${char}`}
                    className="t-digit"
                    style={{ animationDelay: `calc(var(--duration-stagger) * ${index})` }}
                >
                    {char}
                </span>
            ))}
        </span>
    )
}

export function StatsBadge({ views, copies, likes, showLabel = false, className = "" }: StatsBadgeProps) {
    return (
        <div className={`flex items-center gap-3 text-sm ${className}`}>
            {views !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    <AnimatedNumber value={views} />
                    {showLabel && <span className="hidden sm:inline">浏览</span>}
                </div>
            )}
            {copies !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <CopyIcon className="h-3.5 w-3.5" />
                    <AnimatedNumber value={copies} />
                    {showLabel && <span className="hidden sm:inline">复制</span>}
                </div>
            )}
            {likes !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-3.5 w-3.5" />
                    <AnimatedNumber value={likes} />
                    {showLabel && <span className="hidden sm:inline">点赞</span>}
                </div>
            )}
        </div>
    )
}
