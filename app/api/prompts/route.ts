
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
    // Sort by createdAt desc
    prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

        // Ensure dates are parsed
        if (body.createdAt) body.createdAt = new Date(body.createdAt);
        if (body.updatedAt) body.updatedAt = new Date(); // Update modified time
        if (body.publishedAt) body.publishedAt = new Date(body.publishedAt);

        await JSONFileDB.savePrompt(body);
        return NextResponse.json(body);
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
