"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Trash2, Plus, Loader2 } from "lucide-react"
import type { Tag } from "@/lib/types"

function toSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
}

export default function AdminTagsPage() {
    const [tags, setTags] = useState<Tag[]>([])
    const [name, setName] = useState("")
    const [color, setColor] = useState("#94a3b8")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const loadTags = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/tags")
            if (res.ok) {
                setTags(await res.json())
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTags()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName) return

        setSaving(true)
        try {
            const id = toSlug(trimmedName)
            const res = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, slug: id, name: trimmedName, color }),
            })

            if (res.ok) {
                setName("")
                setColor("#94a3b8")
                await loadTags()
            } else {
                alert("保存标签失败")
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("确定删除这个推荐标签吗？已有 Prompt 不会被修改。")) return

        const res = await fetch(`/api/tags?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
        })

        if (res.ok) {
            setTags(current => current.filter(tag => tag.id !== id))
        } else {
            alert("删除标签失败")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">标签管理</h1>
                <p className="text-sm text-muted-foreground mt-1">管理上传表单中的推荐标签，不会批量修改已有 Prompt。</p>
            </div>

            <Card className="p-5">
                <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_140px_auto] gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="tag-name">标签名称</Label>
                        <Input
                            id="tag-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：科技"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag-color">颜色</Label>
                        <Input
                            id="tag-color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-10 p-1"
                        />
                    </div>
                    <Button type="submit" disabled={saving || !name.trim()}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        添加
                    </Button>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <div className="p-4 border-b bg-muted/50 font-medium">推荐标签 ({tags.length})</div>
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">加载中...</div>
                ) : (
                    <div className="divide-y">
                        {tags.map(tag => (
                            <div key={tag.id} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: tag.color || "#94a3b8" }} />
                                    <div className="min-w-0">
                                        <div className="font-medium">{tag.name}</div>
                                        <div className="text-xs text-muted-foreground">{tag.id}</div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    onClick={() => handleDelete(tag.id)}
                                    aria-label="删除标签"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
