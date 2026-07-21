import { NextResponse } from "next/server";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import { getAllStats, isSupabaseConfigured, upsertPromptStats } from "@/server/supabase";

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

    const [prompts, remoteStats] = await Promise.all([
        JSONFileDB.getAllPrompts({ includeContent: false }),
        getAllStats(),
    ]);
    // 与远端取较大值，避免把已经更高的远端计数改小
    const stats = prompts.map(prompt => {
        const remote = remoteStats.get(prompt.id);
        return {
            prompt_id: prompt.id,
            views: Math.max(prompt.views || 0, remote?.views || 0),
            copies: Math.max(prompt.copies || 0, remote?.copies || 0),
            likes: Math.max(prompt.likes || 0, remote?.likes || 0),
        };
    });

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
