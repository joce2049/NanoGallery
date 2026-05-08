import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { JSONFileDB } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import { UPLOADS_DIR, uploadFileCandidates } from "@/server/storage-paths";
import { getRuntimeSettings } from "@/server/settings";

function toPublicPath(src: string) {
    return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}

async function findSourcePath(src: string) {
    const filename = path.basename(src);
    const candidates = src.startsWith("/uploads/")
        ? uploadFileCandidates(filename)
        : [toPublicPath(src)];

    for (const candidate of candidates) {
        try {
            await fs.access(candidate);
            return candidate;
        } catch {
            // Try next candidate.
        }
    }

    return null;
}

export async function POST() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sharp = (await import("sharp")).default;
    const settings = await getRuntimeSettings();
    const uploadConfig = settings.upload;
    const prompts = await JSONFileDB.getAllPrompts({ includeContent: false });
    const updated = [];
    const skipped = [];
    const failed = [];

    for (const prompt of prompts) {
        if (prompt.thumbnailUrl) {
            skipped.push({ id: prompt.id, reason: "exists" });
            continue;
        }

        if (!prompt.imageUrl?.startsWith("/")) {
            skipped.push({ id: prompt.id, reason: "remote-image" });
            continue;
        }

        try {
            const sourcePath = await findSourcePath(prompt.imageUrl);
            if (!sourcePath) {
                failed.push({ id: prompt.id, error: "Source image not found" });
                continue;
            }

            const ext = path.extname(prompt.imageUrl);
            const base = prompt.imageUrl.slice(0, -ext.length);
            const thumbnailUrl = `${base}-thumb.webp`;
            const thumbnailPath = thumbnailUrl.startsWith("/uploads/")
                ? path.join(UPLOADS_DIR, path.basename(thumbnailUrl))
                : toPublicPath(thumbnailUrl);

            await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
            await sharp(sourcePath)
                .rotate()
                .resize({
                    width: uploadConfig.thumbnailDimension,
                    height: uploadConfig.thumbnailDimension,
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: uploadConfig.thumbnailQuality })
                .toFile(thumbnailPath);

            const nextPrompt = {
                ...prompt,
                thumbnailUrl,
                updatedAt: new Date(),
            };

            await JSONFileDB.savePrompt(nextPrompt);
            updated.push({ id: prompt.id, thumbnailUrl });
        } catch (error) {
            failed.push({
                id: prompt.id,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    return NextResponse.json({
        success: true,
        generated: updated.length,
        skipped: skipped.length,
        failed,
        updated,
    });
}
