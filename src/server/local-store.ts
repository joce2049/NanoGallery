import fs from "fs/promises"
import path from "path"
import { DATA_DIR, DATA_MANIFEST_FILE, PROMPT_CONTENT_DIR, PROMPTS_DIR, UPLOADS_DIR } from "./storage-paths"

export const DATA_SCHEMA_VERSION = 1

export type LocalStoreManifest = {
    schemaVersion: number
    app: "nano-gallery"
    createdAt: string
    updatedAt: string
    layout: {
        promptsIndex: "prompts/index.json"
        promptContent: "prompts/content"
        categories: "categories.json"
        tags: "tags.json"
        settings: "settings.json"
        uploads: "../uploads"
    }
}

function buildManifest(now: string, existing?: Partial<LocalStoreManifest>): LocalStoreManifest {
    return {
        schemaVersion: DATA_SCHEMA_VERSION,
        app: "nano-gallery",
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        layout: {
            promptsIndex: "prompts/index.json",
            promptContent: "prompts/content",
            categories: "categories.json",
            tags: "tags.json",
            settings: "settings.json",
            uploads: "../uploads",
        },
    }
}

async function pathExists(filePath: string) {
    try {
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}

export async function atomicWriteFile(filePath: string, data: string | Buffer) {
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    const tempPath = path.join(
        path.dirname(filePath),
        `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
    )

    await fs.writeFile(tempPath, data)
    await fs.rename(tempPath, filePath)
}

export async function atomicWriteJson(filePath: string, data: unknown) {
    await atomicWriteFile(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

export async function ensureLocalStore() {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.mkdir(PROMPTS_DIR, { recursive: true })
    await fs.mkdir(PROMPT_CONTENT_DIR, { recursive: true })
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    if (!(await pathExists(DATA_MANIFEST_FILE))) {
        const now = new Date().toISOString()
        await atomicWriteJson(DATA_MANIFEST_FILE, buildManifest(now))
        return
    }

    const manifest = JSON.parse(await fs.readFile(DATA_MANIFEST_FILE, "utf-8")) as LocalStoreManifest
    if (manifest.schemaVersion > DATA_SCHEMA_VERSION) {
        throw new Error(
            `Unsupported Nano Gallery data schema ${manifest.schemaVersion}. Current app supports ${DATA_SCHEMA_VERSION}.`
        )
    }

    if (manifest.schemaVersion !== DATA_SCHEMA_VERSION || manifest.layout?.settings !== "settings.json") {
        await atomicWriteJson(DATA_MANIFEST_FILE, buildManifest(new Date().toISOString(), manifest))
    }
}

export async function touchLocalStore() {
    await ensureLocalStore()

    const manifest = JSON.parse(await fs.readFile(DATA_MANIFEST_FILE, "utf-8")) as LocalStoreManifest
    await atomicWriteJson(DATA_MANIFEST_FILE, buildManifest(new Date().toISOString(), manifest))
}
