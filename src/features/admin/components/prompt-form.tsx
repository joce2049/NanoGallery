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
import { getImageUrl } from "@/shared/lib/utils"
import { aiModels, appDefaults, aspectRatioOptions, promptStatusIds, promptStatusOptions } from "@/config"
import { useRuntimeSettings } from "@/shared/lib/use-runtime-settings"

interface PromptFormProps {
    initialData?: Partial<Prompt>
    isEditing?: boolean
}

export function PromptForm({ initialData, isEditing = false }: PromptFormProps) {
    const router = useRouter()
    const settings = useRuntimeSettings()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
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
    const [pendingImageMeta, setPendingImageMeta] = useState<{ name: string; size: number } | null>(null)

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
        setPendingImageMeta(null)
    }

    const uploadSelectedFile = async (file: File) => {
        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        })

        const data = await res.json().catch(() => null)
        if (!res.ok) {
            throw new Error(data?.error || "上传失败")
        }

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
            imageUrl: data.url as string,
            thumbnailUrl: (data.thumbnailUrl || "") as string,
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget
        const file = e.target.files?.[0]
        if (!file) return

        if (!settings.upload.allowedTypes.includes(file.type)) {
            alert("仅支持 JPG、PNG、WebP 图片")
            input.value = ""
            return
        }

        if (file.size > settings.upload.maxUploadSize) {
            alert(`图片大小不能超过 ${settings.upload.maxUploadSizeMB}MB`)
            input.value = ""
            return
        }

        clearPendingPreview()
        setPendingFile(file)
        setPendingImageMeta({ name: file.name, size: file.size })
        setUploadMeta(null)
        setPreviewUrl(URL.createObjectURL(file))
        input.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const shouldPublish = status === promptStatusIds.published
        if (shouldPublish && !imageUrl && !pendingFile) return alert("发布前请先选择图片")

        setLoading(true)
        try {
            let nextImageUrl = imageUrl
            let nextThumbnailUrl = thumbnailUrl

            if (pendingFile && shouldPublish) {
                const uploaded = await uploadSelectedFile(pendingFile)
                nextImageUrl = uploaded.imageUrl
                nextThumbnailUrl = uploaded.thumbnailUrl
                setImageUrl(nextImageUrl)
                setThumbnailUrl(nextThumbnailUrl)
                clearPendingPreview()
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
            const url = "/api/prompts"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                router.push("/admin")
                router.refresh()
            } else {
                const data = await res.json().catch(() => null)
                alert(data?.error || "保存失败")
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : "保存出错")
        } finally {
            setLoading(false)
            setUploading(false)
        }
    }

    const displayImageUrl = previewUrl || imageUrl

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image Upload */}
            <div className="space-y-4">
                <Card className="bg-card border-dashed border-2 overflow-hidden aspect-[2/3] flex items-center justify-center relative hover:border-primary/50 transition-colors group">
                    {displayImageUrl ? (
                        <>
                            {previewUrl ? (
                                // 本地预览不会写入服务器，只有状态为“已发布”并提交时才上传。
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="absolute inset-0 h-full w-full object-contain p-2"
                                />
                            ) : (
                                <Image
                                    src={getImageUrl(imageUrl)}
                                    alt="Preview"
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
                                }}
                                className="absolute top-2 right-2 z-20 bg-black/50 p-2 rounded-full hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 z-10 bg-black/60 text-white text-sm font-medium py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {previewUrl ? "本地预览，发布时上传" : "点击替换图片"}
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
                                        <p className="text-sm text-muted-foreground mt-1">支持 JPG, PNG, WebP (Max 10MB)</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading}
                    />
                </Card>

                {pendingImageMeta && (
                    <div className="bg-card border border-border rounded-lg p-4 text-sm space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">待发布图片</span>
                            <span className="truncate">{pendingImageMeta.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">原始大小</span>
                            <span>{formatBytes(pendingImageMeta.size)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">
                            当前仅本地预览；状态为“已发布”并提交后，才会压缩并写入服务器。
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
                    <Label>标题</Label>
                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="如: Cyberpunk Street"
                        className="bg-background"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>中文描述 (Description)</Label>
                    <Input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="简短的中文介绍..."
                        className="bg-background"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <Label>Prompt 内容</Label>
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
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Complete prompt text..."
                        className="bg-background min-h-[120px] font-mono text-sm"
                        required
                    />
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
                    <Select value={status} onValueChange={(value) => setStatus(value as Prompt["status"])}>
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

                <div className="sticky bottom-0 z-10 pt-4 pb-4 bg-background border-t border-border shadow-lg -mx-2 px-2 mt-auto">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || (status === promptStatusIds.published && !imageUrl && !pendingFile)}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {uploading ? "正在上传图片" : isEditing ? "保存修改" : "发布 Prompt"}
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
