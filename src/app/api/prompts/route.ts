
import { NextResponse } from "next/server";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import type { Prompt, SortBy, TimePeriod } from "@/core/types";
import { getPublishedPrompts, sortPrompts } from "@/core/data-utils";
import { getPeriodStats, isSupabaseConfigured } from "@/server/supabase";
import { deletePromptMedia, deleteReplacedPromptMedia } from "@/server/media-cleanup";
import { appDefaults, isPromptStatus, isPublishedPrompt } from "@/config";

const validSorts = new Set(["latest", "popular", "copies", "likes", "trending"]);
const validPeriods = new Set(["today", "week", "month"]);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const sort = searchParams.get("sort") || "latest";
    const period = searchParams.get("period");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    if (id) {
        const prompt = await JSONFileDB.getPromptById(id);
        if (prompt && (isPublishedPrompt(prompt) || await isAuthenticated())) {
            return NextResponse.json(prompt);
        }
        return NextResponse.json({ error: "Not found" }, { status: 404 });
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const status = isPromptStatus(body.status) ? body.status : appDefaults.prompt.status;

        if (isPublishedPrompt({ status }) && !body.imageUrl) {
            return NextResponse.json({ error: "发布前请先上传图片" }, { status: 400 });
        }

        const newPrompt: Prompt = {
            ...body,
            id: Date.now().toString(), // Simple ID generation
            createdAt: new Date(),
            updatedAt: new Date(),
            views: 0,
            copies: 0,
            likes: 0,
            status,
            publishedAt: isPublishedPrompt({ status })
                ? new Date(body.publishedAt || Date.now())
                : undefined,
        };

        await JSONFileDB.savePrompt(newPrompt);
        return NextResponse.json(newPrompt);
    } catch (e) {
        console.error("Save prompt error:", e);
        return NextResponse.json({ error: "Failed to save prompt" }, { status: 500 });
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

        // Fetch existing prompt to preserve createdAt
        const prompts = await JSONFileDB.getAllPrompts();
        const existing = prompts.find(p => p.id === body.id);

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const status = isPromptStatus(body.status) ? body.status : existing?.status || appDefaults.prompt.status;

        if (isPublishedPrompt({ status }) && !body.imageUrl) {
            return NextResponse.json({ error: "发布前请先上传图片" }, { status: 400 });
        }

        // Preserve original createdAt, update updatedAt
        const updatedPrompt = {
            ...body,
            status,
            createdAt: existing?.createdAt || new Date(body.createdAt || Date.now()),
            updatedAt: new Date(),
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

        const prompts = await JSONFileDB.getAllPrompts();
        const existing = prompts.find(p => p.id === body.id);

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
