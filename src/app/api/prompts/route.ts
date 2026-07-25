
import { NextResponse } from "next/server";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import type { Prompt, SortBy, TimePeriod } from "@/core/types";
import { getPublishedPrompts, searchPrompts, sortPrompts } from "@/core/data-utils";
import { getPeriodStats, isSupabaseConfigured } from "@/server/supabase";
import { deletePromptMedia, deleteReplacedPromptMedia } from "@/server/media-cleanup";
import { appDefaults, isPromptStatus, isPublishedPrompt } from "@/config";
import { classifyStorageFailure } from "@/server/storage-errors";
import {
    createAdminPromptError,
    type AdminPromptErrorCode,
} from "@/shared/lib/admin-prompt-errors";

const validSorts = new Set(["latest", "popular", "copies", "likes", "trending"]);
const validPeriods = new Set(["today", "week", "month"]);

function errorResponse(code: AdminPromptErrorCode, status: number) {
    return NextResponse.json(createAdminPromptError(code), { status });
}

function promptSaveErrorResponse(error: unknown) {
    if (error instanceof SyntaxError) return errorResponse("PROMPT_DATA_INVALID", 500);

    const failure = classifyStorageFailure(error);
    if (failure === "full") return errorResponse("PROMPT_STORAGE_FULL", 500);
    if (failure === "permission") return errorResponse("PROMPT_STORAGE_PERMISSION_DENIED", 500);
    return errorResponse("PROMPT_SAVE_FAILED", 500);
}

function isRequestBody(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") || "latest";
    const period = searchParams.get("period");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    if (id) {
        const prompt = await JSONFileDB.getPromptById(id);
        const authenticated = await isAuthenticated();
        if (prompt && (isPublishedPrompt(prompt) || authenticated)) {
            if (!authenticated && prompt.contentPublic === false) {
                return NextResponse.json({ ...prompt, content: "" });
            }
            return NextResponse.json(prompt);
        }
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 全文搜索：在服务端对正文（含未随列表下发的 content）做匹配，返回时剥离正文以保护隐私
    if (q && q.trim()) {
        const all = await JSONFileDB.getAllPrompts({ includeContent: true });
        let matched = searchPrompts(all, q);
        matched = validSorts.has(sort) ? sortPrompts(matched, sort as SortBy) : sortPrompts(matched, "latest");
        if (Number.isFinite(limit) && limit && limit > 0) {
            matched = matched.slice(0, limit);
        }
        return NextResponse.json(matched.map((prompt) => ({ ...prompt, content: "" })));
    }

    const allPrompts = await JSONFileDB.getAllPrompts({ includeContent: false });
    let prompts = getPublishedPrompts(allPrompts);

    if (period && validPeriods.has(period) && isSupabaseConfigured) {
        const periodStats = await getPeriodStats(period as TimePeriod);
        prompts = prompts.sort((a, b) => {
            const aViews = periodStats.get(a.id) || 0;
            const bViews = periodStats.get(b.id) || 0;
            if (aViews !== bViews) return bViews - aViews;
            return (b.views || 0) - (a.views || 0);
        });
    } else if (validSorts.has(sort)) {
        prompts = sortPrompts(prompts, sort as SortBy);
    } else {
        prompts = sortPrompts(prompts, "latest");
    }

    if (Number.isFinite(limit) && limit && limit > 0) {
        prompts = prompts.slice(0, limit);
    }

    return NextResponse.json(prompts);
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) {
        return errorResponse("SESSION_EXPIRED", 401);
    }

    let parsedBody: unknown;
    try {
        parsedBody = await request.json();
    } catch (error) {
        console.error("Parse prompt request error:", error);
        return errorResponse("PROMPT_INVALID_JSON", 400);
    }

    if (!isRequestBody(parsedBody)) {
        return errorResponse("PROMPT_INVALID_BODY", 400);
    }

    const body = parsedBody;
    const title = typeof body.title === "string" ? body.title : "";
    const description = typeof body.description === "string" ? body.description : "";
    const content = typeof body.content === "string" ? body.content : "";

    if (!title.trim()) return errorResponse("PROMPT_TITLE_REQUIRED", 400);
    if (!description.trim()) return errorResponse("PROMPT_DESCRIPTION_REQUIRED", 400);
    if (!content.trim()) return errorResponse("PROMPT_CONTENT_REQUIRED", 400);

    const status = isPromptStatus(body.status) ? body.status : appDefaults.prompt.status;
    const published = isPublishedPrompt({ status });
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
    if (published && !imageUrl.trim()) {
        return errorResponse("PROMPT_IMAGE_REQUIRED", 400);
    }

    let publishedAt: Date | undefined;
    if (published) {
        if (typeof body.publishedAt === "string" || typeof body.publishedAt === "number") {
            publishedAt = new Date(body.publishedAt);
        } else {
            publishedAt = new Date();
        }
    }

    const newPrompt: Prompt = {
        ...(body as unknown as Prompt),
        id: Date.now().toString(), // Simple ID generation
        title,
        description,
        content,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        copies: 0,
        likes: 0,
        contentPublic: body.contentPublic !== false,
        status,
        publishedAt,
    };

    try {
        await JSONFileDB.savePrompt(newPrompt);
        return NextResponse.json(newPrompt);
    } catch (error) {
        console.error("Save prompt error:", error);
        return promptSaveErrorResponse(error);
    }
}

export async function PUT(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        if (!body.id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        // Fetch existing prompt to preserve createdAt/stats
        const existing = await JSONFileDB.getPromptById(body.id);

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const status = isPromptStatus(body.status) ? body.status : existing?.status || appDefaults.prompt.status;

        if (isPublishedPrompt({ status }) && !body.imageUrl) {
            return NextResponse.json({ error: "发布前请先上传图片" }, { status: 400 });
        }

        // Preserve original createdAt/stats, update updatedAt
        const updatedPrompt = {
            ...existing,
            ...body,
            contentPublic: body.contentPublic !== false,
            status,
            createdAt: existing?.createdAt || new Date(body.createdAt || Date.now()),
            updatedAt: new Date(),
            // 统计数据由服务端维护，编辑表单不提交这些字段，必须从既有记录保留，避免被清零
            views: existing.views ?? 0,
            copies: existing.copies ?? 0,
            likes: existing.likes ?? 0,
            publishedAt: isPublishedPrompt({ status }) && !existing?.publishedAt
                ? new Date()
                : body.publishedAt
                    ? new Date(body.publishedAt)
                    : existing?.publishedAt
        };

        await JSONFileDB.savePrompt(updatedPrompt);
        await deleteReplacedPromptMedia(existing, updatedPrompt);
        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error("Update prompt error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        if (!body.id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const existing = await JSONFileDB.getPromptById(body.id);

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const status = isPromptStatus(body.status) ? body.status : existing.status;
        if (isPublishedPrompt({ status }) && !("imageUrl" in body ? body.imageUrl : existing.imageUrl)) {
            return NextResponse.json({ error: "发布前请先上传图片" }, { status: 400 });
        }

        const updatedPrompt: Prompt = {
            ...existing,
            ...body,
            contentPublic: "contentPublic" in body ? body.contentPublic !== false : existing.contentPublic !== false,
            status,
            createdAt: existing.createdAt,
            updatedAt: new Date(),
            publishedAt: isPublishedPrompt({ status }) && !existing.publishedAt
                ? new Date()
                : existing.publishedAt,
        };

        await JSONFileDB.savePrompt(updatedPrompt);
        return NextResponse.json(updatedPrompt);
    } catch {
        return NextResponse.json({ error: "Patch failed" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const prompt = await JSONFileDB.getPromptById(id);
        await JSONFileDB.deletePrompt(id);
        await deletePromptMedia(prompt);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete prompt error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
