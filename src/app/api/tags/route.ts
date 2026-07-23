import { NextResponse } from "next/server";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import { toSlug } from "@/core/slug";
import type { Tag } from "@/core/types";
import { appDefaults } from "@/config";

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
        const oldId = body.oldId ? String(body.oldId).trim() : undefined;

        if (!name || !id) {
            return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
        }

        const existingTags = await JSONFileDB.getAllTags();
        const duplicate = existingTags.find(tag => (
            tag.id !== oldId &&
            (
                tag.id.toLowerCase() === id.toLowerCase() ||
                tag.slug.toLowerCase() === String(body.slug || id).trim().toLowerCase() ||
                tag.name.toLowerCase() === name.toLowerCase()
            )
        ));

        if (duplicate) {
            return NextResponse.json(
                { error: "Tag ID, slug, or name already exists" },
                { status: 409 }
            );
        }

        const tag: Tag = {
            id,
            name,
            slug: String(body.slug || id).trim(),
            color: body.color || appDefaults.tag.color,
        };

        const saved = await JSONFileDB.saveTag(tag, oldId);
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
