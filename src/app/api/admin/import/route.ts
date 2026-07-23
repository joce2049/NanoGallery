import { NextResponse } from "next/server"
import { JSONFileDB } from "@/server/db"
import { isAuthenticated } from "@/server/auth"
import { appDefaults, isPromptStatus } from "@/config"
import type { Category, Prompt, Tag } from "@/core/types"

/** 从备份 JSON 导入：分类 / 标签 / Prompt 均按 id 做 upsert（覆盖同 id，不删除其它数据）。 */
export async function POST(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const prompts: unknown[] = Array.isArray(body?.prompts) ? body.prompts : []
        const categories: unknown[] = Array.isArray(body?.categories) ? body.categories : []
        const tags: unknown[] = Array.isArray(body?.tags) ? body.tags : []

        if (!prompts.length && !categories.length && !tags.length) {
            return NextResponse.json({ error: "文件里没有可导入的数据（prompts/categories/tags 均为空）" }, { status: 400 })
        }

        let importedCategories = 0
        let importedTags = 0
        let importedPrompts = 0

        // 分类、标签先导入，保证 Prompt 引用有效
        for (const item of categories) {
            const c = item as Partial<Category>
            if (!c?.id || !c?.name) continue
            await JSONFileDB.saveCategory({
                id: String(c.id),
                slug: String(c.slug || c.id),
                name: String(c.name),
                description: c.description,
                order: Number(c.order) || 0,
                enabled: c.enabled !== false,
            })
            importedCategories++
        }

        for (const item of tags) {
            const t = item as Partial<Tag>
            if (!t?.id || !t?.name) continue
            await JSONFileDB.saveTag({
                id: String(t.id),
                slug: String(t.slug || t.id),
                name: String(t.name),
                color: t.color,
            })
            importedTags++
        }

        for (const item of prompts) {
            const raw = item as Partial<Prompt>
            if (!raw?.id || !raw?.title) continue
            const now = new Date()
            const prompt: Prompt = {
                id: String(raw.id),
                title: String(raw.title),
                content: String(raw.content || ""),
                contentPublic: raw.contentPublic !== false,
                description: raw.description,
                imageUrl: String(raw.imageUrl || ""),
                thumbnailUrl: raw.thumbnailUrl,
                categoryId: raw.categoryId || appDefaults.prompt.categoryId,
                tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
                metadata: raw.metadata,
                status: isPromptStatus(raw.status) ? raw.status : appDefaults.prompt.status,
                views: Number(raw.views) || 0,
                copies: Number(raw.copies) || 0,
                likes: Number(raw.likes) || 0,
                createdAt: raw.createdAt ? new Date(raw.createdAt) : now,
                updatedAt: now,
                publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : undefined,
            }
            await JSONFileDB.savePrompt(prompt)
            importedPrompts++
        }

        return NextResponse.json({
            success: true,
            imported: { prompts: importedPrompts, categories: importedCategories, tags: importedTags },
        })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "导入失败" },
            { status: 400 },
        )
    }
}
