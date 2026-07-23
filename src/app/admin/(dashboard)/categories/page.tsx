"use client"

import { useEffect, useMemo, useState } from "react"
import { FolderTree, GripVertical, Loader2, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Switch } from "@/shared/ui/switch"
import { AdminPanel } from "@/features/admin/components/admin-panel"
import { toSlug } from "@/core/slug"
import { uiText } from "@/config"
import type { Category } from "@/core/types"
import { toast } from "sonner"

type EditDraft = { name: string; description: string }

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<EditDraft>({ name: "", description: "" })
    const [dragId, setDragId] = useState<string | null>(null)

    const loadCategories = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/categories")
            if (res.ok) setCategories(await res.json())
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadCategories() }, [])

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase()
        if (!keyword) return categories
        return categories.filter(c => c.name.toLowerCase().includes(keyword) || c.id.toLowerCase().includes(keyword))
    }, [categories, query])

    const saveCategory = async (category: Category) => {
        const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(category),
        })
        if (!res.ok) {
            const data = await res.json().catch(() => null)
            throw new Error(data?.error || "保存分类失败")
        }
        return res.json() as Promise<Category>
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName) return

        setSaving(true)
        try {
            const id = toSlug(trimmedName)
            await saveCategory({ id, slug: id, name: trimmedName, description, order: categories.length + 1, enabled: true })
            setName("")
            setDescription("")
            await loadCategories()
            toast.success("已添加分类")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "保存分类失败")
        } finally {
            setSaving(false)
        }
    }

    const startEdit = (category: Category) => {
        setEditingId(category.id)
        setEditDraft({ name: category.name, description: category.description || "" })
    }

    const handleEditSave = async (category: Category) => {
        const trimmedName = editDraft.name.trim()
        if (!trimmedName) return
        setSaving(true)
        try {
            const saved = await saveCategory({ ...category, name: trimmedName, description: editDraft.description })
            setCategories(current => current.map(item => item.id === saved.id ? saved : item))
            setEditingId(null)
            toast.success("已保存")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "保存分类失败")
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (category: Category) => {
        try {
            const saved = await saveCategory({ ...category, enabled: !category.enabled })
            setCategories(current => current.map(item => item.id === saved.id ? saved : item))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "保存分类失败")
        }
    }

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" })
        if (res.ok) {
            setCategories(current => current.filter(category => category.id !== id))
            toast.success("已删除分类")
        } else {
            const data = await res.json().catch(() => null)
            toast.error(data?.error === "Category is still used by prompts" ? "该分类仍被 Prompt 使用，不能删除。" : "删除分类失败")
        }
    }

    // 拖拽排序（仅在未筛选时启用，避免筛选视图下顺序错乱）
    const persistOrder = async (ordered: Category[]) => {
        try {
            for (let i = 0; i < ordered.length; i++) {
                await saveCategory({ ...ordered[i], order: i + 1 })
            }
            toast.success("顺序已保存")
        } catch {
            toast.error("保存顺序失败，请刷新重试")
            loadCategories()
        }
    }

    const handleDrop = (targetId: string) => {
        if (!dragId || dragId === targetId) { setDragId(null); return }
        const fromIndex = categories.findIndex(c => c.id === dragId)
        const toIndex = categories.findIndex(c => c.id === targetId)
        if (fromIndex < 0 || toIndex < 0) { setDragId(null); return }

        const next = [...categories]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        const reordered = next.map((c, i) => ({ ...c, order: i + 1 }))
        setCategories(reordered)
        setDragId(null)
        persistOrder(reordered)
    }

    const canReorder = query.trim() === ""

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <FolderTree className="h-6 w-6" />
                        分类管理
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">管理前台侧栏与上传表单的分类，可改名、启用/隐藏、拖拽排序。</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索分类名称 / ID" className="pl-9" />
                </div>
            </div>

            <AdminPanel>
                <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">分类名称</Label>
                        <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：建筑" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category-description">描述</Label>
                        <Input id="category-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="分类说明" />
                    </div>
                    <Button type="submit" disabled={saving || !name.trim()}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        {uiText.buttons.add}
                    </Button>
                </form>
            </AdminPanel>

            <AdminPanel title="分类列表" count={filtered.length} description={canReorder ? "拖动左侧手柄可调整前台显示顺序" : "搜索状态下不可拖拽排序"} flush>
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">加载中...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">没有找到匹配分类</div>
                ) : (
                    <div className="divide-y divide-border">
                        {filtered.map(category => {
                            const isEditing = editingId === category.id
                            return (
                                <div
                                    key={category.id}
                                    draggable={canReorder && !isEditing}
                                    onDragStart={() => setDragId(category.id)}
                                    onDragOver={(e) => { if (canReorder) e.preventDefault() }}
                                    onDrop={() => canReorder && handleDrop(category.id)}
                                    className={`flex items-center gap-3 p-4 ${dragId === category.id ? "opacity-50" : ""}`}
                                >
                                    {canReorder && !isEditing && (
                                        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/60 active:cursor-grabbing" />
                                    )}

                                    {isEditing ? (
                                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                                            <Input value={editDraft.name} onChange={(e) => setEditDraft(d => ({ ...d, name: e.target.value }))} placeholder="分类名称" className="sm:w-40" />
                                            <Input value={editDraft.description} onChange={(e) => setEditDraft(d => ({ ...d, description: e.target.value }))} placeholder="描述" className="flex-1" />
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" type="button" onClick={() => setEditingId(null)}><X className="mr-1 h-4 w-4" />{uiText.buttons.cancel}</Button>
                                                <Button size="sm" type="button" onClick={() => handleEditSave(category)} disabled={saving || !editDraft.name.trim()}>
                                                    {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}{uiText.buttons.save}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium">{category.name}</div>
                                                <div className="mt-1 truncate text-xs text-muted-foreground">{category.id} · {category.description || "无描述"}</div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{category.enabled ? "启用" : "隐藏"}</span>
                                                    <Switch checked={category.enabled} onCheckedChange={() => handleToggle(category)} />
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => startEdit(category)} aria-label="编辑分类">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)} aria-label="删除分类">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </AdminPanel>
        </div>
    )
}
