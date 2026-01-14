"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/mock-data"
import { SimpleTagInput } from "@/components/ui/simple-tag-input"
import { Prompt } from "@/lib/types"
import { getImageUrl } from "@/lib/utils"

interface PromptFormProps {
    initialData?: Partial<Prompt>
    isEditing?: boolean
}

export function PromptForm({ initialData, isEditing = false }: PromptFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Form State
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [content, setContent] = useState(initialData?.content || "")
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "photography")
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || [])
    const [model, setModel] = useState(initialData?.metadata?.model || "Midjourney v6")
    const [aspectRatio, setAspectRatio] = useState(initialData?.metadata?.aspectRatio || "2:3")

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })
            if (res.ok) {
                const data = await res.json()
                setImageUrl(data.url)
            } else {
                alert("上传失败")
            }
        } catch (e) {
            alert("上传出错")
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageUrl) return alert("请先上传图片")

        setLoading(true)
        try {
            const payload = {
                id: initialData?.id, // Includes ID if editing
                title,
                description,
                content,
                categoryId,
                imageUrl,
                tags: selectedTags,
                metadata: {
                    model,
                    aspectRatio,
                },
                status: initialData?.status || "published"
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
                alert("保存失败")
            }
        } catch (e) {
            alert("保存出错")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image Upload */}
            <div className="space-y-4">
                <Card className="bg-card border-dashed border-2 overflow-hidden aspect-[2/3] flex items-center justify-center relative hover:border-primary/50 transition-colors group">
                    {imageUrl ? (
                        <>
                            <Image
                                src={getImageUrl(imageUrl)}
                                alt="Preview"
                                fill
                                className="object-contain p-2"
                            />
                            <button
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
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
                                        <p className="text-sm text-muted-foreground mt-1">支持 JPG, PNG, GIF, WebP (Max 10MB)</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploading || !!imageUrl}
                    />
                </Card>

                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                    <Label className="text-muted-foreground">元数据</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>模型</Label>
                            <Input
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>比例</Label>
                            <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                    <SelectItem value="2:3">2:3 (Portrait)</SelectItem>
                                    <SelectItem value="3:2">3:2 (Landscape)</SelectItem>
                                    <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                                    <SelectItem value="4:3">4:3 (Landscape)</SelectItem>
                                    <SelectItem value="16:9">16:9 (Wide)</SelectItem>
                                    <SelectItem value="9:16">9:16 (Story)</SelectItem>
                                    <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                                    <SelectItem value="9:21">9:21 (Tall)</SelectItem>
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
                    <Label>Prompt 内容 (English)</Label>
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
                    <Label>标签</Label>
                    <SimpleTagInput value={selectedTags} onChange={setSelectedTags} />
                </div>

                <div className="sticky bottom-0 z-10 pt-4 pb-4 bg-background border-t border-border shadow-lg -mx-2 px-2 mt-auto">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !imageUrl}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isEditing ? "保存修改" : "发布 Prompt"}
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
