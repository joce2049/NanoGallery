export const adminPromptErrorMessages = {
    SESSION_EXPIRED: "登录已过期，请在新标签页重新登录后回来重试，当前填写内容已保留。",
    PROMPT_INVALID_JSON: "提交数据格式异常，请刷新页面后重试。",
    PROMPT_INVALID_BODY: "提交内容无法解析，请刷新页面后重试。",
    PROMPT_TITLE_REQUIRED: "请输入标题。",
    PROMPT_DESCRIPTION_REQUIRED: "请输入中文描述。",
    PROMPT_CONTENT_REQUIRED: "请输入 Prompt 内容。",
    PROMPT_IMAGE_REQUIRED: "发布前请先选择图片。",
    UPLOAD_CONFIG_FAILED: "上传配置读取失败，请检查服务器配置后重试。",
    UPLOAD_INVALID_FORM_DATA: "图片上传请求格式异常，请重新选择图片后重试。",
    UPLOAD_FILE_REQUIRED: "请选择要上传的图片。",
    UPLOAD_UNSUPPORTED_TYPE: "仅支持 JPG、PNG、WebP 图片。",
    UPLOAD_FILE_TOO_LARGE: "图片大小超过上传限制，请重新选择。",
    UPLOAD_INVALID_IMAGE: "图片无法识别或已损坏，请重新选择。",
    UPLOAD_PROCESSING_FAILED: "图片处理失败，请更换图片或稍后重试。",
    UPLOAD_STORAGE_FULL: "服务器存储空间不足，图片无法保存，请清理空间后重试。",
    UPLOAD_STORAGE_PERMISSION_DENIED: "服务器上传目录无写入权限，请检查部署权限后重试。",
    UPLOAD_STORAGE_FAILED: "图片写入服务器失败，请检查存储状态后重试。",
    PROMPT_DATA_INVALID: "Prompt 数据文件格式异常，请检查服务器数据后重试。",
    PROMPT_STORAGE_FULL: "服务器存储空间不足，Prompt 数据无法保存，请清理空间后重试。",
    PROMPT_STORAGE_PERMISSION_DENIED: "服务器数据目录无写入权限，请检查部署权限后重试。",
    PROMPT_SAVE_FAILED: "Prompt 保存失败，请检查服务器状态后重试。",
} as const

export const adminPromptFields = ["title", "description", "content", "image"] as const

export type AdminPromptErrorCode = keyof typeof adminPromptErrorMessages
export type AdminPromptField = (typeof adminPromptFields)[number]

export interface AdminPromptErrorPayload {
    error: string
    code: AdminPromptErrorCode
    field?: AdminPromptField
}

const adminPromptErrorCodes = new Set<AdminPromptErrorCode>(
    Object.keys(adminPromptErrorMessages) as AdminPromptErrorCode[]
)
const adminPromptFieldSet = new Set<AdminPromptField>(adminPromptFields)

const defaultErrorFields: Partial<Record<AdminPromptErrorCode, AdminPromptField>> = {
    PROMPT_TITLE_REQUIRED: "title",
    PROMPT_DESCRIPTION_REQUIRED: "description",
    PROMPT_CONTENT_REQUIRED: "content",
    PROMPT_IMAGE_REQUIRED: "image",
    UPLOAD_FILE_REQUIRED: "image",
    UPLOAD_UNSUPPORTED_TYPE: "image",
    UPLOAD_FILE_TOO_LARGE: "image",
    UPLOAD_INVALID_IMAGE: "image",
}

export function createAdminPromptError(
    code: AdminPromptErrorCode,
    options: { message?: string; field?: AdminPromptField } = {}
): AdminPromptErrorPayload {
    const field = options.field || defaultErrorFields[code]

    return {
        error: options.message || adminPromptErrorMessages[code],
        code,
        ...(field ? { field } : {}),
    }
}

export function isAdminPromptErrorPayload(value: unknown): value is AdminPromptErrorPayload {
    if (!value || typeof value !== "object") return false

    const payload = value as Partial<AdminPromptErrorPayload>
    return typeof payload.error === "string"
        && typeof payload.code === "string"
        && adminPromptErrorCodes.has(payload.code as AdminPromptErrorCode)
        && (payload.field === undefined || adminPromptFieldSet.has(payload.field))
}
