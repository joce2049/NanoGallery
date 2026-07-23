"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { AdminPanel } from "@/features/admin/components/admin-panel"
import { Loader2, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react"
import type { Tag } from "@/core/types"
import { appDefaults, uiText } from "@/config"
import { toSlug } from "@/core/slug"
import { toast } from "sonner"

type TagDraft = { id: string; name: string; slug: string; color: string }

const defaultDraft: TagDraft = { id: "", name: "", slug: "", color: appDefaults.tag.color }

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
            if (res.ok) setTags(await res.json())
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadTags() }, [])

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
        setDraft(current => ({ ...current, name, id: current.id ? current.id : slug, slug: current.slug ? current.slug : slug }))
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
                body: JSON.stringify({ oldId, id, slug, name: trimmedName, color: payload.color || appDefaults.tag.color }),
            })
            if (res.ok) {
                await loadTags()
                return true
            }
            const data = await res.json().catch(() => null)
            toast.error(data?.error || "保存标签失败")
            return false
        } finally {
            setSaving(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await saveTag(draft)
        if (success) {
            setDraft(defaultDraft)
            toast.success("已添加标签")
        }
    }

    const startEdit = (tag: Tag) => {
        setEditingId(tag.id)
        setEditDraft({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color || appDefaults.tag.color })
    }

    const handleEditSave = async () => {
        if (!editingId) return
        const success = await saveTag(editDraft, editingId)
        if (success) {
            setEditingId(null)
            setEditDraft(defaultDraft)
            toast.success("已保存")
        }
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/tags?id=${encodeURIComponent(id)}`, { method: "DELETE" })
        if (res.ok) {
            setTags(current => current.filter(tag => tag.id !== id))
            if (editingId === id) setEditingId(null)
            toast.success("已删除标签")
        } else {
            toast.error("删除标签失败")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">标签管理</h1>
                    <p className="mt-1 text-sm text-muted-foreground">管理推荐标签，可编辑中英文命名、slug 与颜色。</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标签名称 / ID / slug" className="pl-9" />
                </div>
            </div>

            <AdminPanel>
                <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_140px_auto] md:items-end">
                    <div className="space-y-2">
                        <Label htmlFor="tag-name">标签名称</Label>
                        <Input id="tag-name" value={draft.name} onChange={(e) => updateDraftName(e.target.value)} placeholder="例如：黄金时刻" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag-id">英文 ID / slug</Label>
                        <Input id="tag-id" value={draft.id} onChange={(e) => { const id = toSlug(e.target.value); setDraft(c => ({ ...c, id, slug: id })) }} placeholder="golden-hour" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag-color">颜色</Label>
                        <Input id="tag-color" type="color" value={draft.color} onChange={(e) => setDraft(c => ({ ...c, color: e.target.value }))} className="h-10 p-1" />
                    </div>
                    <Button type="submit" disabled={saving || !draft.name.trim()}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        {uiText.buttons.add}
                    </Button>
                </form>
            </AdminPanel>

            <AdminPanel title="推荐标签" count={filteredTags.length} description="多列布局，适合大量标签快速浏览和编辑" bodyClassName="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {loading ? (
                    <div className="col-span-full p-4 text-center text-muted-foreground">加载中...</div>
                ) : filteredTags.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-muted-foreground">没有找到匹配标签</div>
                ) : (
                    filteredTags.map(tag => {
                        const isEditing = editingId === tag.id
                        return (
                            <div key={tag.id} className="rounded-lg bg-muted/40 p-3">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-[1fr_44px] gap-2">
                                            <Input value={editDraft.name} onChange={(e) => setEditDraft(c => ({ ...c, name: e.target.value }))} placeholder="标签名称" />
                                            <Input type="color" value={editDraft.color} onChange={(e) => setEditDraft(c => ({ ...c, color: e.target.value }))} className="h-10 p-1" />
                                        </div>
                                        <Input value={editDraft.id} onChange={(e) => { const id = toSlug(e.target.value); setEditDraft(c => ({ ...c, id, slug: id })) }} placeholder="英文 ID" />
                                        <Input value={editDraft.slug} onChange={(e) => setEditDraft(c => ({ ...c, slug: toSlug(e.target.value) }))} placeholder="slug" />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" type="button" onClick={() => setEditingId(null)}><X className="mr-2 h-4 w-4" />{uiText.buttons.cancel}</Button>
                                            <Button size="sm" type="button" onClick={handleEditSave} disabled={saving || !editDraft.name.trim() || !editDraft.id.trim()}>
                                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{uiText.buttons.save}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: tag.color || appDefaults.tag.color }} />
                                                <div className="truncate font-medium">{tag.name}</div>
                                            </div>
                                            <div className="mt-2 truncate text-xs text-muted-foreground">{tag.id}</div>
                                            <div className="truncate text-xs text-muted-foreground/80">{tag.slug}</div>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => startEdit(tag)} aria-label="编辑标签"><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(tag.id)} aria-label="删除标签"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </AdminPanel>
        </div>
    )
}
