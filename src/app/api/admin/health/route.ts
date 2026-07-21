import { NextResponse } from "next/server";
import fs from "fs/promises";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import { uploadFileCandidates } from "@/server/storage-paths";
import {
    checkSupabaseTable,
    getAllStats,
    getRecentStatEvents,
    isSupabaseConfigured,
} from "@/server/supabase";

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function GET() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [prompts, tags, remoteStats, promptStatsHealth, statEventsHealth, recentEvents] = await Promise.all([
        JSONFileDB.getAllPrompts({ includeContent: false }),
        JSONFileDB.getAllTags(),
        getAllStats(),
        checkSupabaseTable("prompt_stats"),
        checkSupabaseTable("stat_events"),
        getRecentStatEvents(5),
    ]);

    const tagIds = new Set(tags.map(tag => tag.id));
    const promptIds = prompts.map(prompt => prompt.id);
    const duplicatePromptIds = promptIds.filter((id, index) => promptIds.indexOf(id) !== index);
    const unknownTags = Array.from(new Set(prompts.flatMap(prompt => prompt.tags || []).filter(tag => !tagIds.has(tag))));
    const promptsMissingStats = prompts.filter(prompt => (
        !Number.isFinite(prompt.views) ||
        !Number.isFinite(prompt.copies) ||
        !Number.isFinite(prompt.likes)
    ));
    const promptsMissingThumbnails = prompts.filter(prompt => !prompt.thumbnailUrl);
    const brokenThumbnailChecks = await Promise.all(prompts.map(async prompt => {
        if (!prompt.thumbnailUrl?.startsWith("/uploads/")) return null;
        const candidates = uploadFileCandidates(prompt.thumbnailUrl.replace("/uploads/", ""));
        const results = await Promise.all(candidates.map(fileExists));
        return results.some(Boolean) ? null : prompt.id;
    }));
    const promptsWithBrokenThumbnails = brokenThumbnailChecks.filter((id): id is string => id !== null);
    const remoteMissingPromptIds = prompts
        .filter(prompt => !remoteStats.has(prompt.id))
        .map(prompt => prompt.id);
    const remoteLowerThanLocal = prompts
        .map(prompt => {
            const remote = remoteStats.get(prompt.id);
            if (!remote) return null;

            const localTotals = {
                views: prompt.views || 0,
                copies: prompt.copies || 0,
                likes: prompt.likes || 0,
            };
            const remoteTotals = {
                views: remote.views || 0,
                copies: remote.copies || 0,
                likes: remote.likes || 0,
            };

            if (
                remoteTotals.views < localTotals.views ||
                remoteTotals.copies < localTotals.copies ||
                remoteTotals.likes < localTotals.likes
            ) {
                return {
                    id: prompt.id,
                    title: prompt.title,
                    local: localTotals,
                    remote: remoteTotals,
                };
            }

            return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({
        generatedAt: new Date().toISOString(),
        supabase: {
            configured: isSupabaseConfigured,
            promptStats: promptStatsHealth,
            statEvents: statEventsHealth,
            remoteStatsRowsLoaded: remoteStats.size,
            recentEvents,
            remoteMissingPromptIds,
            remoteLowerThanLocal,
        },
        local: {
            prompts: prompts.length,
            tags: tags.length,
            duplicatePromptIds,
            unknownTags,
            promptsMissingStats: promptsMissingStats.map(prompt => prompt.id),
            promptsMissingThumbnails: promptsMissingThumbnails.map(prompt => prompt.id),
            promptsWithBrokenThumbnails,
            totals: prompts.reduce(
                (acc, prompt) => ({
                    views: acc.views + (prompt.views || 0),
                    copies: acc.copies + (prompt.copies || 0),
                    likes: acc.likes + (prompt.likes || 0),
                }),
                { views: 0, copies: 0, likes: 0 }
            ),
        },
    });
}
