import { NextResponse } from "next/server"
import { JSONFileDB } from "@/server/db"
import { isAuthenticated } from "@/server/auth"

export const dynamic = "force-dynamic"

/** 导出完整备份：所有 Prompt（含正文）+ 分类 + 标签。 */
export async function GET() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [prompts, categories, tags] = await Promise.all([
        JSONFileDB.getAllPrompts({ includeContent: true }),
        JSONFileDB.getAllCategories(),
        JSONFileDB.getAllTags(),
    ])

    const body = {
        app: "nano-gallery",
        version: 1,
        exportedAt: new Date().toISOString(),
        counts: { prompts: prompts.length, categories: categories.length, tags: tags.length },
        prompts,
        categories,
        tags,
    }

    return new NextResponse(JSON.stringify(body, null, 2), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="nano-gallery-backup.json"`,
            "Cache-Control": "no-store",
        },
    })
}
