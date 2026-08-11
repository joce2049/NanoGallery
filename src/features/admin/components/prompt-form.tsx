"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Label } from "@/shared/ui/label"
import { Card } from "@/shared/ui/card"
import { Upload, X, Loader2, Lock, Unlock } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { SimpleTagInput } from "@/shared/ui/simple-tag-input"
import type { Category, Prompt } from "@/core/types"
import { cn, getImageUrl } from "@/shared/lib/utils"
import { aiModels, appDefaults, aspectRatioOptions, promptStatusIds, promptStatusOptions } from "@/config"
import { useRuntimeSettings } from "@/shared/lib/use-runtime-settings"
import {
    adminPromptErrorMessages,
    adminPromptFields,
    isAdminPromptErrorPayload,
    type AdminPromptErrorCode,
    type AdminPromptField,
} from "@/shared/lib/admin-prompt-errors"
import { replayAnimation } from "@/shared/lib/motion"
import { toast } from "sonner"

const UPLOAD_TIMEOUT_MS = 120_000
const SAVE_TIMEOUT_MS = 20_000
const SUBMIT_ERROR_TOAST_ID = "prompt-form-submit-error"

const fieldIds: Record<AdminPromptField, string> = {
    title: "prompt-title",
    description: "prompt-description",
    content: "prompt-content",
    image: "prompt-image",
}

function getFieldErrorId(field: AdminPromptField) {
    return `${fieldIds[field]}-error`
}

const imageReselectErrorCodes = new Set<AdminPromptErrorCode>([
    "UPLOAD_UNSUPPORTED_TYPE",
    "UPLOAD_FILE_TOO_LARGE",
    "UPLOAD_INVALID_IMAGE",
])

type FieldErrors = Partial<Record<AdminPromptField, string>>
type SubmitStage = "upload" | "save"
type SubmitState = "idle" | "uploading" | "saving"

const stageMessages: Record<SubmitStage, {
    timeout: string
    network: string
    unavailable: string
    failed: string
}> = {
    upload: {
        timeout: "图片上传响应超时，请检查网络后重试。",
        network: "网络连接异常，无法完成图片上传，请检查网络后重试。",
        unavailable: "图片上传服务暂时不可用，请稍后重试。",
        failed: "图片上传失败，请稍后重试。",
    },
    save: {
        timeout: "Prompt 保存请求超时，无法确认是否已保存；请先在新标签页检查后台列表后再重试。",
        network: "保存时网络连接中断，无法确认 Prompt 是否已保存；请先在新标签页检查后台列表后再重试。",
        unavailable: "Prompt 保存服务暂时不可用，无法确认是否已保存；请先在新标签页检查后台列表后再重试。",
        failed: "Prompt 保存失败，请检查服务器状态后重试。",
    },
}

type ParsedResponseBody = {
    data: unknown
    isJson: boolean
}

type UploadResponse = {
    url: string
    thumbnailUrl?: string
    originalSize: number
    compressedSize: number
    thumbnailSize?: number
    width: number
    height: number
    quality: number
    format: string
}

class PromptSubmissionError extends Error {
    constructor(
        message: string,
        readonly field?: AdminPromptField,
        readonly code?: AdminPromptErrorCode
    ) {
        super(message)
        this.name = "PromptSubmissionError"
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value)
}

function isUploadResponse(value: unknown): value is UploadResponse {
    if (!isRecord(value)) return false

    return typeof value.url === "string"
        && value.url.length > 0
        && (value.thumbnailUrl === undefined || typeof value.thumbnailUrl === "string")
        && isFiniteNumber(value.originalSize)
        && isFiniteNumber(value.compressedSize)
        && (value.thumbnailSize === undefined || isFiniteNumber(value.thumbnailSize))
        && isFiniteNumber(value.width)
        && isFiniteNumber(value.height)
        && isFiniteNumber(value.quality)
        && typeof value.format === "string"
        && value.format.length > 0
}

function isSavedPromptResponse(value: unknown): value is { id: string } {
    return isRecord(value) && typeof value.id === "string" && value.id.length > 0
}

async function fetchWithTimeout(
    input: RequestInfo | URL,
    init: RequestInit,
    timeoutMs: number,
    stage: SubmitStage
) {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

    try {
        return await fetch(input, { ...init, signal: controller.signal })
    } catch (error) {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) {
            throw new PromptSubmissionError(stageMessages[stage].timeout)
        }
        throw new PromptSubmissionError(stageMessages[stage].network)
    } finally {
        window.clearTimeout(timeoutId)
    }
}

async function readResponseBody(response: Response, stage: SubmitStage): Promise<ParsedResponseBody> {
    let text: string
    try {
        text = await response.text()
    } catch {
        throw new PromptSubmissionError(stageMessages[stage].network)
    }

    if (!text) return { data: null, isJson: false }

    try {
        return { data: JSON.parse(text), isJson: true }
    } catch {
        return { data: null, isJson: false }
    }
}

function responseError(
    response: Response,
    body: ParsedResponseBody,
    stage: SubmitStage,
    maxUploadSizeMB: number
) {
    if (isAdminPromptErrorPayload(body.data)) {
        return new PromptSubmissionError(body.data.error, body.data.field, body.data.code)
    }

    if (response.status === 401) {
        return new PromptSubmissionError(
            adminPromptErrorMessages.SESSION_EXPIRED,
            undefined,
            "SESSION_EXPIRED"
        )
    }

    if (stage === "upload" && response.status === 413) {
        return new PromptSubmissionError(
            `图片大小不能超过 ${maxUploadSizeMB}MB。`,
            "image",
            "UPLOAD_FILE_TOO_LARGE"
        )
    }

    if (!body.isJson) {
        return new PromptSubmissionError(stageMessages[stage].unavailable)
    }

    if (stage === "save" && response.status === 404) {
        return new PromptSubmissionError("要保存的 Prompt 不存在，可能已被删除，请返回后台列表确认。")
    }

    return new PromptSubmissionError(stageMessages[stage].failed)
}

function getFieldErrorProps(field: AdminPromptField, error?: string) {
    return {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? getFieldErrorId(field) : undefined,
    } as const
}

function FieldError({ field, error }: { field: AdminPromptField; error?: string }) {
    if (!error) return null

    return (
        <p id={getFieldErrorId(field)} role="alert" className="t-error-msg text-sm text-red-500">
            {error}
        </p>
    )
}

interface PromptFormProps {
    initialData?: Partial<Prompt>
    isEditing?: boolean
}

export function PromptForm({ initialData, isEditing = false }: PromptFormProps) {
    const router = useRouter()
    const settings = useRuntimeSettings()
    const [submitState, setSubmitState] = useState<SubmitState>("idle")
    const loading = submitState !== "idle"
    const uploading = submitState === "uploading"
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const initialModel = aiModels.find(item => (
        item.id === initialData?.metadata?.model ||
        item.name === initialData?.metadata?.model
    ))
    const defaultModelId = aiModels.some(item => item.id === appDefaults.prompt.modelId)
        ? appDefaults.prompt.modelId
        : aiModels[0]?.id || "other"

    // Form State
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "")
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [content, setContent] = useState(initialData?.content || "")
    const [contentPublic, setContentPublic] = useState(initialData?.contentPublic !== false)
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || appDefaults.prompt.categoryId)
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || [])
    const [modelId, setModelId] = useState<string>(initialModel?.id || defaultModelId)
    const [aspectRatio, setAspectRatio] = useState(initialData?.metadata?.aspectRatio || appDefaults.prompt.aspectRatio)
    const [status, setStatus] = useState<Prompt["status"]>(initialData?.status || appDefaults.prompt.status)
    const [categories, setCategories] = useState<Category[]>([])
    const [uploadMeta, setUploadMeta] = useState<{
        originalSize: number
        compressedSize: number
        width: number
        height: number
        quality: number
        format: string
        thumbnailSize?: number
    } | null>(null)

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`
    }

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.ok ? res.json() : [])
            .then((data: Category[]) => setCategories(data.filter(category => category.enabled)))
            .catch(() => setCategories([]))
    }, [])

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const clearPendingPreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl("")
        setPendingFile(null)
    }

    const clearFieldError = (field: AdminPromptField) => {
        setFieldErrors(current => {
            if (!current[field]) return current
            const next = { ...current }
            delete next[field]
            return next
        })
    }

    const focusField = (field: AdminPromptField) => {
        // 抖动 + 聚焦。抖动必须走 replayAnimation：同一字段连续报同样的错时元素类名
        // 没有变化，不强制回流关键帧就不会重跑。
        replayAnimation(
            document.querySelector<HTMLElement>(`[data-shake-field="${field}"]`),
            "is-shaking",
        )
        window.requestAnimationFrame(() => {
            document.getElementById(fieldIds[field])?.focus()
        })
    }

    const validateForm = () => {
        const errors: FieldErrors = {}

        if (!title.trim()) errors.title = adminPromptErrorMessages.PROMPT_TITLE_REQUIRED
        if (!description.trim()) errors.description = adminPromptErrorMessages.PROMPT_DESCRIPTION_REQUIRED
        if (!content.trim()) errors.content = adminPromptErrorMessages.PROMPT_CONTENT_REQUIRED
        if (status === promptStatusIds.published && !imageUrl.trim() && !pendingFile) {
            errors.image = adminPromptErrorMessages.PROMPT_IMAGE_REQUIRED
        }

        setFieldErrors(errors)
        const firstInvalidField = adminPromptFields.find(field => errors[field])
        if (firstInvalidField) focusField(firstInvalidField)

        return !firstInvalidField
    }

    const uploadSelectedFile = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetchWithTimeout(
            "/api/upload",
            { method: "POST", body: formData },
            UPLOAD_TIMEOUT_MS,
            "upload"
        )
        const responseBody = await readResponseBody(response, "upload")

        if (!response.ok) {
            throw responseError(response, responseBody, "upload", settings.upload.maxUploadSizeMB)
        }

        if (!responseBody.isJson || !isUploadResponse(responseBody.data)) {
            throw new PromptSubmissionError("图片上传服务返回的数据异常，请稍后重试。")
        }

        const data = responseBody.data
        setUploadMeta({
            originalSize: data.originalSize,
            compressedSize: data.compressedSize,
            thumbnailSize: data.thumbnailSize,
            width: data.width,
            height: data.height,
            quality: data.quality,
            format: data.format,
        })

        return {
            imageUrl: data.url,
            thumbnailUrl: data.thumbnailUrl || "",
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget
        const file = e.target.files?.[0]
        if (!file) return

        const validationError = !settings.upload.allowedTypes.includes(file.type)
            ? adminPromptErrorMessages.UPLOAD_UNSUPPORTED_TYPE
            : file.size > settings.upload.maxUploadSize
                ? `图片大小不能超过 ${settings.upload.maxUploadSizeMB}MB。`
                : null

        if (validationError) {
            clearPendingPreview()
            setUploadMeta(null)
            setFieldErrors(current => ({ ...current, image: validationError }))
            input.value = ""
            return
        }

        clearPendingPreview()
        if (fieldErrors.image) clearFieldError("image")
        setPendingFile(file)
        setUploadMeta(null)
        setPreviewUrl(URL.createObjectURL(file))
        input.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitState(pendingFile ? "uploading" : "saving")
        try {
            let nextImageUrl = imageUrl
            let nextThumbnailUrl = thumbnailUrl

            if (pendingFile) {
                const uploaded = await uploadSelectedFile(pendingFile)
                nextImageUrl = uploaded.imageUrl
                nextThumbnailUrl = uploaded.thumbnailUrl
                setImageUrl(nextImageUrl)
                setThumbnailUrl(nextThumbnailUrl)
                clearPendingPreview()
                setSubmitState("saving")
            }

            const selectedModel = aiModels.find(item => item.id === modelId)
            const payload = {
                id: initialData?.id, // Includes ID if editing
                title,
                description,
                content,
                contentPublic,
                categoryId,
                imageUrl: nextImageUrl,
                thumbnailUrl: nextThumbnailUrl,
                tags: selectedTags,
                metadata: {
                    model: selectedModel?.name || modelId,
                    aspectRatio,
                },
                status
            }

            const method = isEditing ? "PUT" : "POST"
            const response = await fetchWithTimeout(
                "/api/prompts",
                {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                },
                SAVE_TIMEOUT_MS,
                "save"
            )
            const responseBody = await readResponseBody(response, "save")

            if (!response.ok) {
                throw responseError(response, responseBody, "save", settings.upload.maxUploadSizeMB)
            }

            if (!responseBody.isJson || !isSavedPromptResponse(responseBody.data)) {
                throw new PromptSubmissionError(
                    "服务器返回异常，无法确认 Prompt 是否已保存；请先在新标签页检查后台列表后再重试。"
                )
            }

            toast.success(isEditing ? "已保存修改" : "已发布 Prompt")
            router.push("/admin")
            router.refresh()
        } catch (error) {
            const failure = error instanceof PromptSubmissionError
                ? error
                : new PromptSubmissionError("提交过程中发生未知错误，请稍后重试。")

            if (failure.code && imageReselectErrorCodes.has(failure.code)) {
                clearPendingPreview()
                setUploadMeta(null)
            }

            if (failure.field) {
                setFieldErrors(current => ({ ...current, [failure.field!]: failure.message }))
                focusField(failure.field)
            } else {
                toast.error(failure.message, { id: SUBMIT_ERROR_TOAST_ID })
            }
        } finally {
            setSubmitState("idle")
        }
    }

    const displayImageUrl = previewUrl || imageUrl

    return (
        <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image Upload */}
            <div className="space-y-4">
                <Card
                    {...getFieldErrorProps("image", fieldErrors.image)}
                    data-shake-field="image"
                    className={cn(
                        "t-shake bg-card border-dashed border-2 overflow-hidden aspect-[2/3] flex items-center justify-center relative hover:border-primary/50 transition-colors group",
                        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
                    )}
                >
                    {displayImageUrl ? (
                        <>
                            {previewUrl ? (
                                // 本地预览不会写入服务器，提交表单时才会上传并保存。
                                <img
                                    src={previewUrl}
                                    alt="Prompt 图片预览"
                                    className="absolute inset-0 h-full w-full object-contain p-2"
                                />
                            ) : (
                                <Image
                                    src={getImageUrl(imageUrl)}
                                    alt="Prompt 图片预览"
                                    fill
                                    className="object-contain p-2"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    if (previewUrl) {
                                        clearPendingPreview()
                                    } else {
                                        setImageUrl("")
                                        setThumbnailUrl("")
                                    }
                                    setUploadMeta(null)
                                    clearFieldError("image")
                                }}
                                aria-label="移除图片"
                                className="absolute top-2 right-2 z-20 bg-black/50 p-2 rounded-full hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 z-10 bg-black/60 text-white text-sm font-medium py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {previewUrl ? "本地预览，提交时上传" : "点击替换图片"}
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto" />
                            ) : (
                                <>
                                    <div className="bg-muted p-4 rounded-full w-fit mx-auto">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">点击或拖拽上传图片</p>
                                        <p className="text-sm text-muted-foreground mt-1">支持 JPG、PNG、WebP · 最大 {settings.upload.maxUploadSizeMB}MB</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <input
                        id={fieldIds.image}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Prompt 示例图片"
                        {...getFieldErrorProps("image", fieldErrors.image)}
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading}
                    />
                </Card>

                <FieldError field="image" error={fieldErrors.image} />

                {pendingFile && (
                    <div className="bg-card border border-border rounded-lg p-4 text-sm space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">待发布图片</span>
                            <span className="truncate">{pendingFile.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">原始大小</span>
                            <span>{formatBytes(pendingFile.size)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">
                            当前仅本地预览；提交表单后，才会压缩并写入服务器。
                        </p>
                    </div>
                )}

                {uploadMeta && (
                    <div className="bg-card border border-border rounded-lg p-4 text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">压缩前</span>
                            <span>{formatBytes(uploadMeta.originalSize)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">压缩后</span>
                            <span>{formatBytes(uploadMeta.compressedSize)}</span>
                        </div>
                        {uploadMeta.thumbnailSize !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">缩略图</span>
                                <span>{formatBytes(uploadMeta.thumbnailSize)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">减少比例</span>
                            <span>{Math.max(0, 100 - (uploadMeta.compressedSize / uploadMeta.originalSize) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">输出</span>
                            <span>{uploadMeta.format.toUpperCase()} · {uploadMeta.width}×{uploadMeta.height} · Q{uploadMeta.quality}</span>
                        </div>
                    </div>
                )}

                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                    <Label className="text-muted-foreground">元数据</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>模型</Label>
                            <Select value={modelId} onValueChange={setModelId}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="选择 AI 模型" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {aiModels.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>比例</Label>
                            <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {aspectRatioOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Info Form */}
            <div className="space-y-6 pb-4">
                <div className="space-y-2">
                    <Label htmlFor={fieldIds.title}>标题</Label>
                    <Input
                        id={fieldIds.title}
                        value={title}
                        onChange={e => {
                            setTitle(e.target.value)
                            if (fieldErrors.title) clearFieldError("title")
                        }}
                        {...getFieldErrorProps("title", fieldErrors.title)}
                        data-shake-field="title"
                        placeholder="如: Cyberpunk Street"
                        className="t-shake bg-background"
                        required
                    />
                    <FieldError field="title" error={fieldErrors.title} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor={fieldIds.description}>中文描述 (Description)</Label>
                    <Input
                        id={fieldIds.description}
                        value={description}
                        onChange={e => {
                            setDescription(e.target.value)
                            if (fieldErrors.description) clearFieldError("description")
                        }}
                        {...getFieldErrorProps("description", fieldErrors.description)}
                        data-shake-field="description"
                        placeholder="简短的中文介绍..."
                        className="t-shake bg-background"
                        required
                    />
                    <FieldError field="description" error={fieldErrors.description} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <Label htmlFor={fieldIds.content}>Prompt 内容</Label>
                        <Button
                            type="button"
                            variant={contentPublic ? "secondary" : "outline"}
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => setContentPublic((value) => !value)}
                        >
                            {contentPublic ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            {contentPublic ? "公开" : "不公开"}
                        </Button>
                    </div>
                    <Textarea
                        id={fieldIds.content}
                        value={content}
                        onChange={e => {
                            setContent(e.target.value)
                            if (fieldErrors.content) clearFieldError("content")
                        }}
                        {...getFieldErrorProps("content", fieldErrors.content)}
                        data-shake-field="content"
                        placeholder="Complete prompt text..."
                        className="t-shake bg-background min-h-[180px] max-h-[45vh] overflow-y-auto font-mono text-sm"
                        required
                    />
                    <FieldError field="content" error={fieldErrors.content} />
                </div>

                <div className="space-y-2">
                    <Label>分类</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>状态</Label>
                    <Select
                        value={status}
                        onValueChange={(value) => {
                            const nextStatus = value as Prompt["status"]
                            setStatus(nextStatus)
                            if (nextStatus !== promptStatusIds.published && fieldErrors.image) {
                                clearFieldError("image")
                            }
                        }}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {promptStatusOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>标签</Label>
                    <SimpleTagInput value={selectedTags} onChange={setSelectedTags} />
                </div>

                <div className="sticky bottom-0 z-10 pt-4 pb-4 bg-background border-t border-border -mx-2 px-2 mt-auto">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {uploading ? "正在上传图片" : isEditing ? "正在保存修改" : "正在保存 Prompt"}
                            </>
                        ) : (
                            isEditing ? "保存修改" : "发布 Prompt"
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}
