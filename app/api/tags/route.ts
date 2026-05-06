import { NextResponse } from "next/server";
import { JSONFileDB } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { Tag } from "@/lib/types";

function toSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "");
}

export async function GET() {
    const tags = await JSONFileDB.getAllTags();
    return NextResponse.json(tags);
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const name = String(body.name || "").trim();
        const id = String(body.id || body.slug || toSlug(name)).trim();

        if (!name || !id) {
            return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
        }

        const tag: Tag = {
            id,
            name,
            slug: String(body.slug || id).trim(),
            color: body.color || "#94a3b8",
        };

        const saved = await JSONFileDB.saveTag(tag);
        return NextResponse.json(saved);
    } catch (error) {
        console.error("Save tag error:", error);
        return NextResponse.json({ error: "Failed to save tag" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await JSONFileDB.deleteTag(id);
    return NextResponse.json({ success: true });
}
