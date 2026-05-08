import { NextResponse } from "next/server";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import type { Prompt } from "@/core/types";
import { deletePromptMedia } from "@/server/media-cleanup";
import { isPromptStatus, isPublishedPrompt } from "@/config";

export async function PATCH(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];

        if (ids.length === 0) {
            return NextResponse.json({ error: "Prompt IDs are required" }, { status: 400 });
        }

        const updates: Partial<Pick<Prompt, "status" | "categoryId" | "tags">> = {};

        if (body.status) {
            if (!isPromptStatus(body.status)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 });
            }
            updates.status = body.status;
        }

        if (body.categoryId) {
            updates.categoryId = body.categoryId;
        }

        if (Array.isArray(body.tags)) {
            updates.tags = body.tags;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No updates provided" }, { status: 400 });
        }

        if (updates.status && isPublishedPrompt({ status: updates.status })) {
            const idSet = new Set(ids);
            const prompts = await JSONFileDB.getAllPrompts({ includeContent: false });
            const missingImage = prompts.filter(prompt => idSet.has(prompt.id) && !prompt.imageUrl);

            if (missingImage.length > 0) {
                return NextResponse.json(
                    { error: `有 ${missingImage.length} 个 Prompt 没有图片，不能发布` },
                    { status: 400 }
                );
            }
        }

        const updated = await JSONFileDB.updatePrompts(ids, updates);
        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error("Batch update prompts error:", error);
        return NextResponse.json({ error: "Batch update failed" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];

        if (ids.length === 0) {
            return NextResponse.json({ error: "Prompt IDs are required" }, { status: 400 });
        }

        const idSet = new Set(ids);
        const prompts = await JSONFileDB.getAllPrompts({ includeContent: false });
        const promptsToDelete = prompts.filter(prompt => idSet.has(prompt.id));

        const deleted = await JSONFileDB.deletePrompts(ids);
        await Promise.all(promptsToDelete.map(deletePromptMedia));
        return NextResponse.json({ success: true, deleted });
    } catch (error) {
        console.error("Batch delete prompts error:", error);
        return NextResponse.json({ error: "Batch delete failed" }, { status: 500 });
    }
}
