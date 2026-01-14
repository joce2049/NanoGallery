/**
 * 数据查询和统计工具函数
 */

import type { Prompt, Category, Tag, TimePeriod, SortBy, DailyStat } from "./types"
import { prompts, categories, tags, dailyStats } from "./mock-data"

/**
 * 获取所有已发布的 Prompt
 */
export function getAllPrompts(): Prompt[] {
    return prompts.filter((p) => p.status === "published")
}

/**
 * 根据 ID 获取 Prompt
 */
export function getPromptById(id: string): Prompt | undefined {
    return prompts.find((p) => p.id === id && p.status === "published")
}

/**
 * 根据分类 slug 获取 Prompts
 */
export function getPromptsByCategory(slug: string): Prompt[] {
    const category = categories.find((c) => c.slug === slug && c.enabled)
    if (!category) return []

    return prompts.filter((p) => p.categoryId === category.id && p.status === "published")
}

/**
 * 根据标签 slug 获取 Prompts
 */
export function getPromptsByTag(slug: string): Prompt[] {
    const tag = tags.find((t) => t.slug === slug)
    if (!tag) return []

    return prompts.filter((p) => p.tags.includes(tag.id) && p.status === "published")
}

/**
 * 搜索 Prompts
 */
export function searchPrompts(query: string): Prompt[] {
    const lowerQuery = query.toLowerCase()

    return prompts.filter((p) => {
        if (p.status !== "published") return false

        const titleMatch = p.title.toLowerCase().includes(lowerQuery)
        const contentMatch = p.content.toLowerCase().includes(lowerQuery)
        const descMatch = p.description?.toLowerCase().includes(lowerQuery)

        return titleMatch || contentMatch || descMatch
    })
}

/**
 * 获取分类信息
 */
export function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find((c) => c.slug === slug && c.enabled)
}

/**
 * 获取所有启用的分类
 */
export function getAllCategories(): Category[] {
    return categories.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}

/**
 * 获取标签信息
 */
export function getTagBySlug(slug: string): Tag | undefined {
    return tags.find((t) => t.slug === slug)
}

/**
 * 获取所有标签
 */
export function getAllTags(): Tag[] {
    return tags
}

/**
 * 获取 Prompt 的标签对象
 */
export function getPromptTags(prompt: Prompt): Tag[] {
    return tags.filter((t) => prompt.tags.includes(t.id))
}

/**
 * 计算时间范围内的统计数据
 */
function getStatsForPeriod(period: TimePeriod): DailyStat[] {
    const today = new Date()
    let daysAgo = 1

    switch (period) {
        case "today":
            daysAgo = 1
            break
        case "week":
            daysAgo = 7
            break
        case "month":
            daysAgo = 30
            break
    }

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - daysAgo)
    const startDateStr = startDate.toISOString().split("T")[0]

    return dailyStats.filter((stat) => stat.date >= startDateStr)
}

/**
 * 获取热门 Prompts
 */
export function getTopPrompts(period: TimePeriod, limit = 20, sortBy: "views" | "copies" = "views"): Prompt[] {
    const stats = getStatsForPeriod(period)

    // 按 Prompt ID 聚合统计数据
    const aggregated = new Map<string, { views: number; copies: number }>()

    stats.forEach((stat) => {
        const existing = aggregated.get(stat.promptId) || { views: 0, copies: 0 }
        aggregated.set(stat.promptId, {
            views: existing.views + stat.views,
            copies: existing.copies + stat.copies,
        })
    })

    // 获取 Prompt 并附加统计数据
    const promptsWithStats = Array.from(aggregated.entries())
        .map(([promptId, stats]) => {
            const prompt = getPromptById(promptId)
            if (!prompt) return null

            return {
                prompt,
                periodViews: stats.views,
                periodCopies: stats.copies,
            }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

    // 排序
    promptsWithStats.sort((a, b) => {
        if (sortBy === "views") {
            return b.periodViews - a.periodViews
        }
        return b.periodCopies - a.periodCopies
    })

    return promptsWithStats.slice(0, limit).map((item) => item.prompt)
}

/**
 * 排序 Prompts
 */
export function sortPrompts(prompts: Prompt[], sortBy: SortBy): Prompt[] {
    const sorted = [...prompts]

    switch (sortBy) {
        case "latest":
            sorted.sort((a, b) => {
                const getDate = (d: Date | string | undefined | null) => {
                    if (!d) return 0
                    return new Date(d).getTime()
                }
                // Use updatedAt (latest modification) as primary, fallback to createdAt
                const dateA = getDate(a.updatedAt || a.createdAt)
                const dateB = getDate(b.updatedAt || b.createdAt)
                return dateB - dateA
            })
            break
        case "popular":
            // 热门：按浏览量排序
            sorted.sort((a, b) => b.views - a.views)
            break
        case "trending":
            // 趋势：按点赞量排序
            sorted.sort((a, b) => b.likes - a.likes)
            break
        case "today":
        case "week":
        case "month":
            // 时间段：筛选后按浏览量排序
            const now = new Date()
            let days = 0
            if (sortBy === 'today') days = 1
            if (sortBy === 'week') days = 7
            if (sortBy === 'month') days = 30

            const threshold = new Date(now.setDate(now.getDate() - days)).getTime()

            // Filter in place (modify sorted array)
            // Note: sort function expects to return sorting order, not filter.
            // But we need to filter first.
            const getDate = (d: Date | string | undefined | null) => {
                if (!d) return 0
                return new Date(d).getTime()
            }

            const filtered = sorted.filter(p => getDate(p.publishedAt || p.createdAt) >= threshold)

            // Sort filtered by views
            filtered.sort((a, b) => b.views - a.views)
            return filtered
    }

    return sorted

    return sorted
}

/**
 * 分页
 */
export function paginatePrompts(prompts: Prompt[], page = 1, pageSize = 12) {
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
        data: prompts.slice(start, end),
        total: prompts.length,
        page,
        pageSize,
        totalPages: Math.ceil(prompts.length / pageSize),
        hasMore: end < prompts.length,
    }
}

/**
 * 记录浏览
 */
export async function recordView(promptId: string): Promise<void> {
    // 调用 API 持久化到 Supabase（不再更新本地内存）
    try {
        await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptId, eventType: 'view' })
        })
        console.log(`[Analytics] View recorded for prompt: ${promptId}`)
    } catch (error) {
        console.error('[Analytics] Failed to record view:', error)
    }
}

/**
 * 记录复制
 */
export async function recordCopy(promptId: string): Promise<void> {
    try {
        await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptId, eventType: 'copy' })
        })
        console.log(`[Analytics] Copy recorded for prompt: ${promptId}`)
    } catch (error) {
        console.error('[Analytics] Failed to record copy:', error)
    }
}

/**
 * 记录点赞
 */
export async function recordLike(promptId: string): Promise<void> {
    try {
        await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptId, eventType: 'like' })
        })
        console.log(`[Analytics] Like recorded for prompt: ${promptId}`)
    } catch (error) {
        console.error('[Analytics] Failed to record like:', error)
    }
}

/**
 * 获取相关 Prompts（基于分类和标签）
 */
export function getRelatedPrompts(prompt: Prompt, limit = 6): Prompt[] {
    const allPrompts = getAllPrompts().filter((p) => p.id !== prompt.id)

    // 计算相似度分数
    const scored = allPrompts.map((p) => {
        let score = 0

        // 同分类 +3
        if (p.categoryId === prompt.categoryId) score += 3

        // 共同标签 +1 per tag
        const commonTags = p.tags.filter((tag) => prompt.tags.includes(tag))
        score += commonTags.length

        return { prompt: p, score }
    })

    // 按分数排序
    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, limit).map((item) => item.prompt)
}

/**
 * 获取 Prompt 统计信息（某个时间段）
 */
export function getPromptStats(promptId: string, period: TimePeriod) {
    const stats = getStatsForPeriod(period).filter((s) => s.promptId === promptId)

    const total = stats.reduce(
        (acc, stat) => ({
            views: acc.views + stat.views,
            copies: acc.copies + stat.copies,
        }),
        { views: 0, copies: 0 }
    )

    return total
}
