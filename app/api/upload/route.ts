
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 2400;
const THUMBNAIL_DIMENSION = 640;
const WEBP_QUALITY = 90;
const THUMBNAIL_QUALITY = 84;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ error: "Only JPG, PNG, and WebP are supported" }, { status: 400 });
        }

        if (file.size > MAX_UPLOAD_SIZE) {
            return NextResponse.json({ error: "File size must be 10MB or less" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const sharp = (await import("sharp")).default;

        const image = sharp(buffer, { failOn: "error" }).rotate();
        const metadata = await image.metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        const compressedBuffer = await image
            .resize({
                width: width >= height ? MAX_DIMENSION : undefined,
                height: height > width ? MAX_DIMENSION : undefined,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();

        const thumbnailBuffer = await sharp(buffer, { failOn: "error" })
            .rotate()
            .resize({
                width: THUMBNAIL_DIMENSION,
                height: THUMBNAIL_DIMENSION,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: THUMBNAIL_QUALITY })
            .toBuffer();

        const outputMetadata = await sharp(compressedBuffer).metadata();
        const id = crypto.randomUUID();
        const filename = `${id}.webp`;
        const thumbnailFilename = `${id}-thumb.webp`;

        const uploadDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);
        await writeFile(filepath, compressedBuffer);
        await writeFile(thumbnailPath, thumbnailBuffer);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            thumbnailUrl: `/uploads/${thumbnailFilename}`,
            format: "webp",
            originalSize: file.size,
            compressedSize: compressedBuffer.length,
            thumbnailSize: thumbnailBuffer.length,
            width: outputMetadata.width || width,
            height: outputMetadata.height || height,
            quality: WEBP_QUALITY,
            thumbnailQuality: THUMBNAIL_QUALITY,
        });
    } catch (e) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
