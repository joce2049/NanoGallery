
import { NextResponse } from "next/server";
import { JSONFileDB } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { Prompt } from "@/lib/types";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
        const prompts = await JSONFileDB.getAllPrompts();
        const prompt = prompts.find(p => p.id === id);
        if (prompt) return NextResponse.json(prompt);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const prompts = await JSONFileDB.getAllPrompts();
    // Sort by updatedAt desc (latest modified or created first)
    prompts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
    });

    // Debug logging
    console.log('[Admin API] Sorted prompts:');
    prompts.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. ID:${p.id} Title:"${p.title?.substring(0, 20)}" UpdatedAt:${p.updatedAt} CreatedAt:${p.createdAt}`);
    });

    return NextResponse.json(prompts);
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const newPrompt: Prompt = {
            ...body,
            id: Date.now().toString(), // Simple ID generation
            createdAt: new Date(),
            updatedAt: new Date(),
            views: 0,
            copies: 0,
            likes: 0,
            status: "published" // Default to published for simplicity
        };

        if (newPrompt.publishedAt) {
            newPrompt.publishedAt = new Date(newPrompt.publishedAt);
        }

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

        // Preserve original createdAt, update updatedAt
        const updatedPrompt = {
            ...body,
            createdAt: existing?.createdAt || new Date(body.createdAt || Date.now()),
            updatedAt: new Date(),
            publishedAt: body.publishedAt ? new Date(body.publishedAt) : existing?.publishedAt
        };

        await JSONFileDB.savePrompt(updatedPrompt);
        return NextResponse.json(updatedPrompt);
    } catch (e) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
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

        await JSONFileDB.deletePrompt(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
