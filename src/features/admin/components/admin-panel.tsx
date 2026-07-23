import * as React from "react"
import { cn } from "@/shared/lib/utils"

/**
 * 后台统一面板：单层、无阴影、发丝级边框。
 * 用它替代默认 Card（border + shadow-sm + py-6），并避免「卡中卡」的多层边框嵌套。
 */
export function AdminPanel({
    title,
    count,
    description,
    action,
    children,
    className,
    bodyClassName,
    flush = false,
}: {
    title?: React.ReactNode
    count?: number
    description?: React.ReactNode
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
    bodyClassName?: string
    /** flush：内容自带内边距/分隔（如 divide-y 列表），面板不再包一层 p-4 */
    flush?: boolean
}) {
    const hasHeader = title != null || action != null

    return (
        <section className={cn("rounded-lg border border-border bg-card", className)}>
            {hasHeader && (
                <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                    <div className="min-w-0">
                        <div className="text-sm font-medium">
                            {title}
                            {count != null && <span className="text-muted-foreground"> ({count})</span>}
                        </div>
                        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            )}
            {flush ? children : <div className={cn("p-4", bodyClassName)}>{children}</div>}
        </section>
    )
}

/**
 * 概览指标块：无边框、无阴影、轻底色，替代一排「带边框+阴影的 MetricCard」。
 */
export function AdminStat({
    label,
    value,
    detail,
}: {
    label: React.ReactNode
    value: React.ReactNode
    detail?: React.ReactNode
}) {
    return (
        <div className="rounded-lg bg-muted/40 px-4 py-3">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
            {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
        </div>
    )
}
