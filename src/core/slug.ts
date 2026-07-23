/**
 * 把中文/英文名称转成 URL 友好的 slug（保留中文、字母、数字与连字符）。
 * 前台页面与后台 API 共用同一实现，避免多处重复。
 */
export function toSlug(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9一-龥-]/g, "")
}
