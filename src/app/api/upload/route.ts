
import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/server/auth";
import { UPLOADS_DIR } from "@/server/storage-paths";
import { appDefaults } from "@/config";
import { atomicWriteFile } from "@/server/local-store";
import { getRuntimeSettings } from "@/server/settings";

const ALLOWED_TYPES = new Set<string>(appDefaults.upload.allowedTypes);

export async function POST(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const settings = await getRuntimeSettings();
        const uploadConfig = {
            maxUploadSize: settings.upload.maxUploadSizeMB * 1024 * 1024,
            maxDimension: settings.upload.maxDimension,
            thumbnailDimension: settings.upload.thumbnailDimension,
            webpQuality: settings.upload.webpQuality,
            thumbnailQuality: settings.upload.thumbnailQuality,
        };

        // 先按 Content-Length 提前拒绝超大请求，避免把整个 body 读入内存
        const contentLength = Number(request.headers.get("content-length") || 0);
        if (contentLength && contentLength > uploadConfig.maxUploadSize + 1024 * 1024) {
            return NextResponse.json(
                { error: `File size must be ${settings.upload.maxUploadSizeMB}MB or less` },
                { status: 413 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ error: "Only JPG, PNG, and WebP are supported" }, { status: 400 });
        }

        if (file.size > uploadConfig.maxUploadSize) {
            return NextResponse.json({ error: `File size must be ${settings.upload.maxUploadSizeMB}MB or less` }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const sharp = (await import("sharp")).default;

        const image = sharp(buffer, { failOn: "error" }).rotate();
        const metadata = await image.metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        const compressedBuffer = await image
            .resize({
                width: width >= height ? uploadConfig.maxDimension : undefined,
                height: height > width ? uploadConfig.maxDimension : undefined,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: uploadConfig.webpQuality })
            .toBuffer();

        const thumbnailBuffer = await sharp(buffer, { failOn: "error" })
            .rotate()
            .resize({
                width: uploadConfig.thumbnailDimension,
                height: uploadConfig.thumbnailDimension,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: uploadConfig.thumbnailQuality })
            .toBuffer();

        const outputMetadata = await sharp(compressedBuffer).metadata();
        const id = crypto.randomUUID();
        const filename = `${id}.webp`;
        const thumbnailFilename = `${id}-thumb.webp`;

        const uploadDir = UPLOADS_DIR;
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);
        await atomicWriteFile(filepath, compressedBuffer);
        await atomicWriteFile(thumbnailPath, thumbnailBuffer);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            thumbnailUrl: `/uploads/${thumbnailFilename}`,
            format: "webp",
            originalSize: file.size,
            compressedSize: compressedBuffer.length,
            thumbnailSize: thumbnailBuffer.length,
            width: outputMetadata.width || width,
            height: outputMetadata.height || height,
            quality: uploadConfig.webpQuality,
            thumbnailQuality: uploadConfig.thumbnailQuality,
        });
    } catch (e) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
