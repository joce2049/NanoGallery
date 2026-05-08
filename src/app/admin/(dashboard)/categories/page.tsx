"use client"

import { useEffect, useState } from "react"
import { FolderTree, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Switch } from "@/shared/ui/switch"
import type { Category } from "@/core/types"

function toSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const loadCategories = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/categories")
            if (res.ok) setCategories(await res.json())
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

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

        return res.json()
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName) return

        setSaving(true)
        try {
            const id = toSlug(trimmedName)
            await saveCategory({
                id,
                slug: id,
                name: trimmedName,
                description,
                order: categories.length + 1,
                enabled: true,
            })
            setName("")
            setDescription("")
            await loadCategories()
        } catch (error) {
            alert(error instanceof Error ? error.message : "保存分类失败")
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (category: Category) => {
        try {
            const saved = await saveCategory({ ...category, enabled: !category.enabled })
            setCategories(current => current.map(item => item.id === saved.id ? saved : item))
        } catch (error) {
            alert(error instanceof Error ? error.message : "保存分类失败")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("确定删除这个分类吗？仍被 Prompt 使用的分类不能删除。")) return

        const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" })
        if (res.ok) {
            setCategories(current => current.filter(category => category.id !== id))
        } else {
            const data = await res.json().catch(() => null)
            alert(data?.error === "Category is still used by prompts" ? "该分类仍被 Prompt 使用，不能删除。" : "删除分类失败")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FolderTree className="h-6 w-6" />
                    分类管理
                </h1>
                <p className="text-sm text-muted-foreground mt-1">管理前台侧边栏、首页分类筛选和后台上传表单中的分类。</p>
            </div>

            <Card className="p-5">
                <form onSubmit={handleCreate} className="grid grid-cols-[1fr_1.4fr_auto] gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">分类名称</Label>
                        <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：建筑" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category-description">描述</Label>
                        <Input id="category-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="分类说明" />
                    </div>
                    <Button type="submit" disabled={saving || !name.trim()}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        添加
                    </Button>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <div className="p-4 border-b bg-muted/50 font-medium">分类列表 ({categories.length})</div>
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">加载中...</div>
                ) : (
                    <div className="divide-y">
                        {categories.map(category => (
                            <div key={category.id} className="p-4 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="font-medium">{category.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {category.id} · {category.description || "无描述"}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{category.enabled ? "启用" : "隐藏"}</span>
                                        <Switch checked={category.enabled} onCheckedChange={() => handleToggle(category)} />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                        onClick={() => handleDelete(category.id)}
                                        aria-label="删除分类"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
