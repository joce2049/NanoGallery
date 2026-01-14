import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getType } from "mime"; // You might need to add mime-types or just fallback

export async function GET(
    request: Request,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;

    try {
        // Sanitize filename to prevent directory traversal
        const sanitizedFilename = path.basename(filename);

        const filePath = path.join(process.cwd(), "public/uploads", sanitizedFilename);

        const fileBuffer = await readFile(filePath);

        const ext = path.extname(sanitizedFilename);
        const contentType = getContentType(ext);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (e) {
        console.error("Error serving file:", e);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}

function getContentType(ext: string): string {
    switch (ext.toLowerCase()) {
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".gif":
            return "image/gif";
        case ".webp":
            return "image/webp";
        case ".svg":
            return "image/svg+xml";
        default:
            return "application/octet-stream";
    }
}
