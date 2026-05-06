import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { JSONFileDB } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

const THUMBNAIL_DIMENSION = 640;
const THUMBNAIL_QUALITY = 76;

function toPublicPath(src: string) {
    return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}

export async function POST() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sharp = (await import("sharp")).default;
    const prompts = await JSONFileDB.getAllPrompts();
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
            const sourcePath = toPublicPath(prompt.imageUrl);
            await fs.access(sourcePath);

            const ext = path.extname(prompt.imageUrl);
            const base = prompt.imageUrl.slice(0, -ext.length);
            const thumbnailUrl = `${base}-thumb.webp`;
            const thumbnailPath = toPublicPath(thumbnailUrl);

            await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
            await sharp(sourcePath)
                .rotate()
                .resize({
                    width: THUMBNAIL_DIMENSION,
                    height: THUMBNAIL_DIMENSION,
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: THUMBNAIL_QUALITY })
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
