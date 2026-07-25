import { NextResponse } from "next/server";
import path from "path";
import { isAuthenticated } from "@/server/auth";
import { UPLOADS_DIR } from "@/server/storage-paths";
import { appDefaults } from "@/config";
import { atomicWriteFile } from "@/server/local-store";
import { getRuntimeSettings } from "@/server/settings";
import { classifyStorageFailure } from "@/server/storage-errors";
import {
    createAdminPromptError,
    type AdminPromptErrorCode,
} from "@/shared/lib/admin-prompt-errors";

const ALLOWED_TYPES = new Set<string>(appDefaults.upload.allowedTypes);
const ALLOWED_IMAGE_FORMATS = new Set(
    appDefaults.upload.allowedTypes.map(type => type.replace("image/", "").replace("jpg", "jpeg"))
);

function errorResponse(code: AdminPromptErrorCode, status: number, message?: string) {
    return NextResponse.json(createAdminPromptError(code, { message }), { status });
}

function uploadStorageErrorResponse(
    error: unknown,
    fallbackCode: "UPLOAD_CONFIG_FAILED" | "UPLOAD_STORAGE_FAILED"
) {
    const failure = classifyStorageFailure(error);
    if (failure === "full") return errorResponse("UPLOAD_STORAGE_FULL", 500);
    if (failure === "permission") return errorResponse("UPLOAD_STORAGE_PERMISSION_DENIED", 500);
    return errorResponse(fallbackCode, 500);
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) {
        return errorResponse("SESSION_EXPIRED", 401);
    }

    let settings;
    try {
        settings = await getRuntimeSettings();
    } catch (error) {
        console.error("Upload config error:", error);
        return uploadStorageErrorResponse(error, "UPLOAD_CONFIG_FAILED");
    }

    const uploadConfig = {
        maxUploadSize: settings.upload.maxUploadSizeMB * 1024 * 1024,
        maxDimension: settings.upload.maxDimension,
        thumbnailDimension: settings.upload.thumbnailDimension,
        webpQuality: settings.upload.webpQuality,
        thumbnailQuality: settings.upload.thumbnailQuality,
    };
    const tooLargeMessage = `图片大小不能超过 ${settings.upload.maxUploadSizeMB}MB。`;

    // 先按 Content-Length 提前拒绝超大请求，避免把整个 body 读入内存
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength && contentLength > uploadConfig.maxUploadSize + 1024 * 1024) {
        return errorResponse("UPLOAD_FILE_TOO_LARGE", 413, tooLargeMessage);
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch (error) {
        console.error("Upload form-data error:", error);
        return errorResponse("UPLOAD_INVALID_FORM_DATA", 400);
    }

    const uploadedFile = formData.get("file");
    if (!(uploadedFile instanceof File)) {
        return errorResponse("UPLOAD_FILE_REQUIRED", 400);
    }

    if (!ALLOWED_TYPES.has(uploadedFile.type)) {
        return errorResponse("UPLOAD_UNSUPPORTED_TYPE", 400);
    }

    if (uploadedFile.size > uploadConfig.maxUploadSize) {
        return errorResponse("UPLOAD_FILE_TOO_LARGE", 400, tooLargeMessage);
    }

    if (uploadedFile.size === 0) {
        return errorResponse("UPLOAD_INVALID_IMAGE", 400);
    }

    let buffer: Buffer;
    try {
        buffer = Buffer.from(await uploadedFile.arrayBuffer());
    } catch (error) {
        console.error("Upload file read error:", error);
        return errorResponse("UPLOAD_INVALID_IMAGE", 400);
    }

    let sharpModule;
    try {
        sharpModule = await import("sharp");
    } catch (error) {
        console.error("Upload sharp load error:", error);
        return errorResponse("UPLOAD_PROCESSING_FAILED", 500);
    }
    const sharp = sharpModule.default;

    let width = 0;
    let height = 0;
    try {
        const metadata = await sharp(buffer, { failOn: "error" }).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;

        if (!width || !height) {
            return errorResponse("UPLOAD_INVALID_IMAGE", 400);
        }

        if (!metadata.format || !ALLOWED_IMAGE_FORMATS.has(metadata.format)) {
            return errorResponse("UPLOAD_UNSUPPORTED_TYPE", 400);
        }
    } catch (error) {
        console.error("Upload image decode error:", error);
        return errorResponse("UPLOAD_INVALID_IMAGE", 400);
    }

    let compressedBuffer: Buffer;
    let thumbnailBuffer: Buffer;
    let outputWidth = width;
    let outputHeight = height;
    try {
        [compressedBuffer, thumbnailBuffer] = await Promise.all([
            sharp(buffer, { failOn: "error" })
                .rotate()
                .resize({
                    width: width >= height ? uploadConfig.maxDimension : undefined,
                    height: height > width ? uploadConfig.maxDimension : undefined,
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: uploadConfig.webpQuality })
                .toBuffer(),
            sharp(buffer, { failOn: "error" })
                .rotate()
                .resize({
                    width: uploadConfig.thumbnailDimension,
                    height: uploadConfig.thumbnailDimension,
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: uploadConfig.thumbnailQuality })
                .toBuffer(),
        ]);

        const outputMetadata = await sharp(compressedBuffer).metadata();
        outputWidth = outputMetadata.width || width;
        outputHeight = outputMetadata.height || height;
    } catch (error) {
        console.error("Upload image processing error:", error);
        return errorResponse("UPLOAD_PROCESSING_FAILED", 500);
    }

    const id = crypto.randomUUID();
    const filename = `${id}.webp`;
    const thumbnailFilename = `${id}-thumb.webp`;
    const filepath = path.join(UPLOADS_DIR, filename);
    const thumbnailPath = path.join(UPLOADS_DIR, thumbnailFilename);

    try {
        await atomicWriteFile(filepath, compressedBuffer);
        await atomicWriteFile(thumbnailPath, thumbnailBuffer);
    } catch (error) {
        console.error("Upload storage error:", error);
        return uploadStorageErrorResponse(error, "UPLOAD_STORAGE_FAILED");
    }

    return NextResponse.json({
        url: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/${thumbnailFilename}`,
        format: "webp",
        originalSize: uploadedFile.size,
        compressedSize: compressedBuffer.length,
        thumbnailSize: thumbnailBuffer.length,
        width: outputWidth,
        height: outputHeight,
        quality: uploadConfig.webpQuality,
        thumbnailQuality: uploadConfig.thumbnailQuality,
    });
}
