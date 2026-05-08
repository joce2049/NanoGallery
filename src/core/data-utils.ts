/**
 * 数据筛选、排序、分页和标签映射工具。
 * 不在这里读取数据文件，调用方负责传入 prompts/tags/categories。
 */

import type { Prompt, Category, Tag, SortBy } from "./types"
import { appDefaults, isPublishedPrompt } from "@/config"

export function getPublishedPrompts(prompts: Prompt[]): Prompt[] {
    return prompts.filter(isPublishedPrompt)
}

export function findPromptById(prompts: Prompt[], id: string): Prompt | undefined {
    return prompts.find((p) => p.id === id && isPublishedPrompt(p))
}

export function filterPromptsByCategory(prompts: Prompt[], categories: Category[], slug: string): Prompt[] {
    const category = categories.find((c) => c.slug === slug && c.enabled)
    if (!category) return []

    return prompts.filter((p) => p.categoryId === category.id && isPublishedPrompt(p))
}

export function filterPromptsByTag(prompts: Prompt[], tags: Tag[], slugOrId: string): Prompt[] {
    const tag = tags.find((t) => t.slug === slugOrId || t.id === slugOrId)
    const tagId = tag?.id || slugOrId

    return prompts.filter((p) => p.tags.includes(tagId) && isPublishedPrompt(p))
}

export function searchPrompts(prompts: Prompt[], query: string): Prompt[] {
    const lowerQuery = query.trim().toLowerCase()
    if (!lowerQuery) return []

    return prompts.filter((p) => {
        if (!isPublishedPrompt(p)) return false

        const titleMatch = p.title.toLowerCase().includes(lowerQuery)
        const contentMatch = p.content.toLowerCase().includes(lowerQuery)
        const descMatch = p.description?.toLowerCase().includes(lowerQuery)

        return titleMatch || contentMatch || descMatch
    })
}

export function getCategoryBySlug(categories: Category[], slug: string): Category | undefined {
    return categories.find((c) => c.slug === slug && c.enabled)
}

export function getAllCategories(categories: Category[]): Category[] {
    return categories.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}

export function getTagBySlug(tags: Tag[], slugOrId: string): Tag | undefined {
    return tags.find((t) => t.slug === slugOrId || t.id === slugOrId)
}

export function getPromptTags(prompt: Prompt, tags: Tag[]): Tag[] {
    return prompt.tags.map((tagId) => {
        return tags.find((t) => t.id === tagId) || {
            id: tagId,
            slug: tagId,
            name: tagId,
            color: appDefaults.tag.color,
        }
    })
}

function getDateValue(date: Date | string | undefined | null): number {
    if (!date) return 0
    return new Date(date).getTime()
}

export function sortPrompts(prompts: Prompt[], sortBy: SortBy): Prompt[] {
    const sorted = [...prompts]

    switch (sortBy) {
        case "latest":
            return sorted.sort((a, b) => {
                const dateA = getDateValue(a.updatedAt || a.createdAt)
                const dateB = getDateValue(b.updatedAt || b.createdAt)
                return dateB - dateA
            })
        case "popular":
            return sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
        case "copies":
        case "trending":
            return sorted.sort((a, b) => (b.copies || 0) - (a.copies || 0))
        case "likes":
            return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        default:
            return sorted
    }
}

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

export async function recordView(promptId: string): Promise<void> {
    await recordStat(promptId, "view")
}

export async function recordCopy(promptId: string): Promise<void> {
    await recordStat(promptId, "copy")
}

export async function recordLike(promptId: string): Promise<void> {
    await recordStat(promptId, "like")
}

async function recordStat(promptId: string, eventType: "view" | "copy" | "like"): Promise<void> {
    try {
        await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptId, eventType })
        })
    } catch (error) {
        console.error(`[Analytics] Failed to record ${eventType}:`, error)
    }
}

export function getRelatedPrompts(prompt: Prompt, allPrompts: Prompt[], limit = 6): Prompt[] {
    const candidates = allPrompts.filter((p) => p.id !== prompt.id && isPublishedPrompt(p))

    const scored = candidates.map((p) => {
        let score = 0

        if (p.categoryId === prompt.categoryId) score += 3

        const commonTags = p.tags.filter((tag) => prompt.tags.includes(tag))
        score += commonTags.length

        return { prompt: p, score }
    })

    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (b.prompt.views || 0) - (a.prompt.views || 0)
    })

    return scored.slice(0, limit).map((item) => item.prompt)
}
