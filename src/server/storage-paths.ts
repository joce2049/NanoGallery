import path from "path"

export const STORAGE_DIR = process.env.NANO_STORAGE_DIR || path.join(process.cwd(), "storage")
export const DATA_DIR = process.env.NANO_DATA_DIR || path.join(STORAGE_DIR, "data")
export const UPLOADS_DIR = process.env.NANO_UPLOADS_DIR || path.join(STORAGE_DIR, "uploads")

export const PROMPTS_DIR = path.join(DATA_DIR, "prompts")
export const PROMPTS_INDEX_FILE = path.join(PROMPTS_DIR, "index.json")
export const PROMPT_CONTENT_DIR = path.join(PROMPTS_DIR, "content")
export const TAGS_FILE = path.join(DATA_DIR, "tags.json")
export const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json")
export const SETTINGS_FILE = path.join(DATA_DIR, "settings.json")
export const DATA_MANIFEST_FILE = path.join(DATA_DIR, "manifest.json")
export const BACKUP_DIR = path.join(STORAGE_DIR, "backups")

export function uploadFileCandidates(filename: string) {
    return [path.join(UPLOADS_DIR, filename)]
}
