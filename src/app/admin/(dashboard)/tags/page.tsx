"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Card } from "@/shared/ui/card"
import { Loader2, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react"
import type { Tag } from "@/core/types"
import { appDefaults } from "@/config"

function toSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
}

type TagDraft = {
    id: string
    name: string
    slug: string
    color: string
}

const defaultDraft: TagDraft = {
    id: "",
    name: "",
    slug: "",
    color: appDefaults.tag.color,
}

export default function AdminTagsPage() {
    const [tags, setTags] = useState<Tag[]>([])
    const [draft, setDraft] = useState<TagDraft>(defaultDraft)
    const [editDraft, setEditDraft] = useState<TagDraft>(defaultDraft)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [query, setQuery] = useState("")
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

    const filteredTags = useMemo(() => {
        const keyword = query.trim().toLowerCase()
        if (!keyword) return tags

        return tags.filter(tag => (
            tag.name.toLowerCase().includes(keyword) ||
            tag.id.toLowerCase().includes(keyword) ||
            tag.slug.toLowerCase().includes(keyword)
        ))
    }, [query, tags])

    const updateDraftName = (name: string) => {
        const slug = toSlug(name)
        setDraft(current => ({
            ...current,
            name,
            id: current.id ? current.id : slug,
            slug: current.slug ? current.slug : slug,
        }))
    }

    const saveTag = async (payload: TagDraft, oldId?: string) => {
        const trimmedName = payload.name.trim()
        const id = payload.id.trim() || toSlug(trimmedName)
        const slug = payload.slug.trim() || id

        if (!trimmedName || !id) return false

        setSaving(true)
        try {
            const res = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldId,
                    id,
                    slug,
                    name: trimmedName,
                    color: payload.color || appDefaults.tag.color,
                }),
            })

            if (res.ok) {
                await loadTags()
                return true
            }

            const data = await res.json().catch(() => null)
            alert(data?.error || "保存标签失败")
            return false
        } finally {
            setSaving(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await saveTag(draft)
        if (success) setDraft(defaultDraft)
    }

    const startEdit = (tag: Tag) => {
        setEditingId(tag.id)
        setEditDraft({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color || appDefaults.tag.color,
        })
    }

    const handleEditSave = async () => {
        if (!editingId) return

        const success = await saveTag(editDraft, editingId)
        if (success) {
            setEditingId(null)
            setEditDraft(defaultDraft)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("确定删除这个推荐标签吗？已有 Prompt 不会被批量修改。")) return

        const res = await fetch(`/api/tags?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
        })

        if (res.ok) {
            setTags(current => current.filter(tag => tag.id !== id))
            if (editingId === id) setEditingId(null)
        } else {
            alert("删除标签失败")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">标签管理</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        管理推荐标签，可编辑中英文命名、slug 与颜色。
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="搜索标签名称 / ID / slug"
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="p-5">
                <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_140px_auto] md:items-end">
                    <div className="space-y-2">
                        <Label htmlFor="tag-name">标签名称</Label>
                        <Input
                            id="tag-name"
                            value={draft.name}
                            onChange={(event) => updateDraftName(event.target.value)}
                            placeholder="例如：黄金时刻"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag-id">英文 ID / slug</Label>
                        <Input
                            id="tag-id"
                            value={draft.id}
                            onChange={(event) => {
                                const id = toSlug(event.target.value)
                                setDraft(current => ({ ...current, id, slug: id }))
                            }}
                            placeholder="golden-hour"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag-color">颜色</Label>
                        <Input
                            id="tag-color"
                            type="color"
                            value={draft.color}
                            onChange={(event) => setDraft(current => ({ ...current, color: event.target.value }))}
                            className="h-10 p-1"
                        />
                    </div>
                    <Button type="submit" disabled={saving || !draft.name.trim()}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        添加
                    </Button>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <div className="flex items-center justify-between gap-4 border-b bg-muted/50 p-4">
                    <div>
                        <div className="font-medium">推荐标签 ({filteredTags.length}/{tags.length})</div>
                        <p className="text-xs text-muted-foreground mt-1">多列卡片布局，适合大量标签快速浏览和编辑。</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">加载中...</div>
                ) : filteredTags.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">没有找到匹配标签</div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filteredTags.map(tag => {
                            const isEditing = editingId === tag.id

                            return (
                                <div key={tag.id} className="rounded-lg border border-border bg-card p-3">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-[1fr_44px] gap-2">
                                                <Input
                                                    value={editDraft.name}
                                                    onChange={(event) => setEditDraft(current => ({ ...current, name: event.target.value }))}
                                                    placeholder="标签名称"
                                                />
                                                <Input
                                                    type="color"
                                                    value={editDraft.color}
                                                    onChange={(event) => setEditDraft(current => ({ ...current, color: event.target.value }))}
                                                    className="h-10 p-1"
                                                />
                                            </div>
                                            <Input
                                                value={editDraft.id}
                                                onChange={(event) => {
                                                    const id = toSlug(event.target.value)
                                                    setEditDraft(current => ({ ...current, id, slug: id }))
                                                }}
                                                placeholder="英文 ID"
                                            />
                                            <Input
                                                value={editDraft.slug}
                                                onChange={(event) => setEditDraft(current => ({ ...current, slug: toSlug(event.target.value) }))}
                                                placeholder="slug"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingId(null)}
                                                    type="button"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    取消
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleEditSave}
                                                    disabled={saving || !editDraft.name.trim() || !editDraft.id.trim()}
                                                    type="button"
                                                >
                                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                                    保存
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-4 w-4 shrink-0 rounded-full border" style={{ backgroundColor: tag.color || appDefaults.tag.color }} />
                                                    <div className="truncate font-medium">{tag.name}</div>
                                                </div>
                                                <div className="mt-2 truncate text-xs text-muted-foreground">{tag.id}</div>
                                                <div className="truncate text-xs text-muted-foreground/80">{tag.slug}</div>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => startEdit(tag)}
                                                    aria-label="编辑标签"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(tag.id)}
                                                    aria-label="删除标签"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </Card>
        </div>
    )
}
