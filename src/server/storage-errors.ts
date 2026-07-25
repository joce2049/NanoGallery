export type StorageFailureKind = "full" | "permission" | "other"

export function classifyStorageFailure(error: unknown): StorageFailureKind {
    if (!error || typeof error !== "object") return "other"

    const code = (error as { code?: unknown }).code
    if (code === "ENOSPC" || code === "EDQUOT") return "full"
    if (code === "EACCES" || code === "EPERM" || code === "EROFS") return "permission"
    return "other"
}
