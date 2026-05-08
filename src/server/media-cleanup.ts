import fs from "fs/promises"
import path from "path"
import type { Prompt } from "@/core/types"
import { uploadFileCandidates } from "./storage-paths"

const UPLOAD_PREFIX = "/uploads/"

function toUploadPaths(src: string | null | undefined): string[] {
    if (!src?.startsWith(UPLOAD_PREFIX)) return []

    const filename = path.basename(src)
    if (!filename || filename === "." || filename === "..") return []

    return uploadFileCandidates(filename)
}

async function deleteUploadedFile(src: string | null | undefined) {
    const filePaths = toUploadPaths(src)
    if (filePaths.length === 0) return

    await Promise.all(filePaths.map(async (filePath) => {
        try {
            await fs.unlink(filePath)
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                console.error("[Media cleanup] Failed to delete uploaded file:", src, error)
            }
        }
    }))
}

export async function deletePromptMedia(prompt: Pick<Prompt, "imageUrl" | "thumbnailUrl"> | null | undefined) {
    if (!prompt) return

    await Promise.all([
        deleteUploadedFile(prompt.imageUrl),
        deleteUploadedFile(prompt.thumbnailUrl),
    ])
}

export async function deleteReplacedPromptMedia(
    previous: Pick<Prompt, "imageUrl" | "thumbnailUrl"> | null | undefined,
    next: Pick<Prompt, "imageUrl" | "thumbnailUrl"> | null | undefined
) {
    if (!previous || !next) return

    const filesToDelete = new Set<string>()

    if (previous.imageUrl && previous.imageUrl !== next.imageUrl) {
        filesToDelete.add(previous.imageUrl)
    }

    if (previous.thumbnailUrl && previous.thumbnailUrl !== next.thumbnailUrl) {
        filesToDelete.add(previous.thumbnailUrl)
    }

    await Promise.all(Array.from(filesToDelete).map(deleteUploadedFile))
}
