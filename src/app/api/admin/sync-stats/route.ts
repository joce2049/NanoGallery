import { NextResponse } from "next/server";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import { isSupabaseConfigured, upsertPromptStats } from "@/server/supabase";

export async function POST() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured) {
        return NextResponse.json(
            { error: "Supabase is not configured" },
            { status: 400 }
        );
    }

    const prompts = await JSONFileDB.getAllPrompts({ includeContent: false });
    const stats = prompts.map(prompt => ({
        prompt_id: prompt.id,
        views: prompt.views || 0,
        copies: prompt.copies || 0,
        likes: prompt.likes || 0,
    }));

    const result = await upsertPromptStats(stats);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error?.message || "Failed to sync stats", details: result.error },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        synced: stats.length,
        totals: stats.reduce(
            (acc, stat) => ({
                views: acc.views + stat.views,
                copies: acc.copies + stat.copies,
                likes: acc.likes + stat.likes,
            }),
            { views: 0, copies: 0, likes: 0 }
        ),
    });
}
