import { NextResponse } from "next/server";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import type { Category } from "@/core/types";

function toSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "");
}

export async function GET() {
    const categories = await JSONFileDB.getAllCategories();
    return NextResponse.json(categories);
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
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        const category: Category = {
            id,
            name,
            slug: String(body.slug || id).trim(),
            description: body.description || "",
            order: Number(body.order ?? 999),
            enabled: body.enabled ?? true,
        };

        const saved = await JSONFileDB.saveCategory(category);
        return NextResponse.json(saved);
    } catch (error) {
        console.error("Save category error:", error);
        return NextResponse.json({ error: "Failed to save category" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const prompts = await JSONFileDB.getAllPrompts({ includeContent: false });
    if (prompts.some(prompt => prompt.categoryId === id)) {
        return NextResponse.json(
            { error: "Category is still used by prompts" },
            { status: 409 }
        );
    }

    await JSONFileDB.deleteCategory(id);
    return NextResponse.json({ success: true });
}
