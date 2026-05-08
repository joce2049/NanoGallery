import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { uploadFileCandidates } from "@/server/storage-paths";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    try {
        // Sanitize filename to prevent directory traversal
        const sanitizedFilename = path.basename(filename);

        let fileBuffer: Buffer | null = null;
        for (const filePath of uploadFileCandidates(sanitizedFilename)) {
            try {
                fileBuffer = await readFile(filePath);
                break;
            } catch {
                // Try the next runtime or legacy uploads directory.
            }
        }

        if (!fileBuffer) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const ext = path.extname(sanitizedFilename);
        const contentType = getContentType(ext);

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
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
