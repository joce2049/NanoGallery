import fs from "fs/promises"
import { appDefaults } from "@/config"
import { defaultRuntimeSettings, type PublicRuntimeSettings, type RuntimeSettings } from "@/core/settings"
import { SETTINGS_FILE } from "./storage-paths"
import { atomicWriteJson, ensureLocalStore, touchLocalStore } from "./local-store"

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return fallback
    return Math.min(max, Math.max(min, Math.round(parsed)))
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
    if (typeof value !== "string") return fallback
    const trimmed = value.trim()
    return trimmed.slice(0, maxLength) || fallback
}

export function normalizeRuntimeSettings(input: unknown): RuntimeSettings {
    const data = (input && typeof input === "object" ? input : {}) as Partial<RuntimeSettings>
    const site: Partial<RuntimeSettings["site"]> = data.site || {}
    const upload: Partial<RuntimeSettings["upload"]> = data.upload || {}
    const prompt: Partial<RuntimeSettings["prompt"]> = data.prompt || {}
    const defaults = defaultRuntimeSettings

    return {
        site: {
            name: cleanText(site.name, defaults.site.name, 80),
            description: cleanText(site.description, defaults.site.description, 240),
            metadataTitle: cleanText(site.metadataTitle, defaults.site.metadataTitle, 120),
            metadataDescription: cleanText(site.metadataDescription, defaults.site.metadataDescription, 240),
            copyrightText: cleanText(site.copyrightText, defaults.site.copyrightText, 120),
            adminName: cleanText(site.adminName, defaults.site.adminName, 80),
            adminTitle: cleanText(site.adminTitle, defaults.site.adminTitle, 120),
        },
        upload: {
            maxUploadSizeMB: clampNumber(upload.maxUploadSizeMB, defaults.upload.maxUploadSizeMB, 1, 100),
            maxDimension: clampNumber(upload.maxDimension, defaults.upload.maxDimension, 512, 8000),
            thumbnailDimension: clampNumber(upload.thumbnailDimension, defaults.upload.thumbnailDimension, 128, 2000),
            webpQuality: clampNumber(upload.webpQuality, defaults.upload.webpQuality, 50, 100),
            thumbnailQuality: clampNumber(upload.thumbnailQuality, defaults.upload.thumbnailQuality, 40, 100),
        },
        prompt: {
            lockedContentMessage: cleanText(prompt.lockedContentMessage, defaults.prompt.lockedContentMessage, 180),
        },
    }
}

export async function getRuntimeSettings(): Promise<RuntimeSettings> {
    await ensureLocalStore()

    try {
        const raw = await fs.readFile(SETTINGS_FILE, "utf-8")
        return normalizeRuntimeSettings(JSON.parse(raw))
    } catch {
        await saveRuntimeSettings(defaultRuntimeSettings)
        return defaultRuntimeSettings
    }
}

export async function saveRuntimeSettings(settings: unknown): Promise<RuntimeSettings> {
    await ensureLocalStore()
    const normalized = normalizeRuntimeSettings(settings)
    await atomicWriteJson(SETTINGS_FILE, normalized)
    await touchLocalStore()
    return normalized
}

export function toPublicRuntimeSettings(settings: RuntimeSettings): PublicRuntimeSettings {
    return {
        ...settings,
        upload: {
            ...settings.upload,
            allowedTypes: appDefaults.upload.allowedTypes,
            maxUploadSize: settings.upload.maxUploadSizeMB * 1024 * 1024,
        },
    }
}
