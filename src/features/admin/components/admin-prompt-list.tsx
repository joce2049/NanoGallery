
"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, Copy, Heart, Image as ImageIcon, Edit, Trash2, Search, RotateCcw, CheckSquare, Square } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { Category, Prompt } from "@/core/types"
import { getPromptPreviewUrl } from "@/shared/lib/utils"
import { appDefaults, getPromptStatusLabel, promptStatusIds, promptStatusOptions } from "@/config"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/ui/alert-dialog"

interface AdminPromptListProps {
    initialPrompts: Prompt[]
}

interface PromptStats {
    views: number
    copies: number
    likes: number
}

const statusBadgeClass: Record<Prompt["status"], string> = {
    published: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
    archived: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
    draft: "bg-secondary text-secondary-foreground border-border",
}

export function AdminPromptList({ initialPrompts }: AdminPromptListProps) {
    const router = useRouter()
    const [prompts, setPrompts] = useState(initialPrompts)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [stats, setStats] = useState<Record<string, PromptStats>>({})
    const [categories, setCategories] = useState<Category[]>([])
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [batchStatus, setBatchStatus] = useState("")
    const [batchCategoryId, setBatchCategoryId] = useState("")
    const [batchLoading, setBatchLoading] = useState(false)

    // Fetch stats from Supabase on mount
    useEffect(() => {
        if (prompts.length === 0) return

        const promptIds = prompts.map(p => p.id).join(',')
        fetch(`/api/stats/batch?promptIds=${promptIds}`)
            .then(res => res.json())
            .then(data => {
                if (data.stats) {
                    setStats(data.stats)
                }
            })
            .catch(console.error)
    }, [prompts])

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.ok ? res.json() : [])
            .then((data: Category[]) => setCategories(data))
            .catch(() => setCategories([]))
    }, [])

    const categoryNameMap = new Map(categories.map(category => [category.id, category.name]))

    const filteredPrompts = prompts.filter(prompt => {
        const lowerQuery = query.trim().toLowerCase()
        const matchesQuery = !lowerQuery ||
            prompt.title.toLowerCase().includes(lowerQuery) ||
            prompt.content.toLowerCase().includes(lowerQuery) ||
            prompt.description?.toLowerCase().includes(lowerQuery)
        const matchesStatus = statusFilter === "all" || prompt.status === statusFilter
        const matchesCategory = categoryFilter === "all" || prompt.categoryId === categoryFilter

        return matchesQuery && matchesStatus && matchesCategory
    })

    const filteredIds = filteredPrompts.map(prompt => prompt.id)
    const selectedSet = new Set(selectedIds)
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedSet.has(id))

    const toggleSelection = (id: string) => {
        setSelectedIds(current => current.includes(id)
            ? current.filter(item => item !== id)
            : [...current, id]
        )
    }

    const toggleSelectAllFiltered = () => {
        if (allFilteredSelected) {
            setSelectedIds(current => current.filter(id => !filteredIds.includes(id)))
        } else {
            setSelectedIds(current => Array.from(new Set([...current, ...filteredIds])))
        }
    }

    const applyBatchUpdate = async () => {
        if (selectedIds.length === 0) return

        const payload: { ids: string[]; status?: string; categoryId?: string } = { ids: selectedIds }
        if (batchStatus) payload.status = batchStatus
        if (batchCategoryId) payload.categoryId = batchCategoryId

        if (!payload.status && !payload.categoryId) {
            alert("请选择要批量修改的状态或分类")
            return
        }

        setBatchLoading(true)
        try {
            const res = await fetch("/api/prompts/batch", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error("批量更新失败")

            const data: { updated: Prompt[] } = await res.json()
            const updatedMap = new Map(data.updated.map(prompt => [prompt.id, prompt]))
            setPrompts(current => current.map(prompt => updatedMap.get(prompt.id) || prompt))
            setBatchStatus("")
            setBatchCategoryId("")
            router.refresh()
        } catch (error) {
            alert(error instanceof Error ? error.message : "批量更新失败")
        } finally {
            setBatchLoading(false)
        }
    }

    const deleteSelected = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`确定删除选中的 ${selectedIds.length} 个 Prompt 吗？此操作无法撤销。`)) return

        setBatchLoading(true)
        try {
            const res = await fetch("/api/prompts/batch", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
            })

            if (!res.ok) throw new Error("批量删除失败")

            setPrompts(current => current.filter(prompt => !selectedIds.includes(prompt.id)))
            setSelectedIds([])
            router.refresh()
        } catch (error) {
            alert(error instanceof Error ? error.message : "批量删除失败")
        } finally {
            setBatchLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const res = await fetch(`/api/prompts?id=${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setPrompts(prompts.filter(p => p.id !== id))
                router.refresh()
            } else {
                alert("Failed to delete")
            }
        } catch {
            alert("Error deleting")
        } finally {
            setDeletingId(null)
            setConfirmDeleteId(null)
        }
    }

    const handleToggleStatus = async (prompt: Prompt) => {
        const nextStatus = prompt.status === appDefaults.prompt.status ? promptStatusIds.draft : appDefaults.prompt.status
        setUpdatingId(prompt.id)
        try {
            const res = await fetch("/api/prompts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: prompt.id, status: nextStatus }),
            })

            if (res.ok) {
                const updatedPrompt: Prompt = await res.json()
                setPrompts(current => current.map(item => item.id === prompt.id ? updatedPrompt : item))
                router.refresh()
            } else {
                const data = await res.json().catch(() => null)
                alert(data?.error || "状态更新失败")
            }
        } catch {
            alert("状态更新出错")
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <>
            <div className="p-4 border-b border-border bg-background/60 grid grid-cols-1 lg:grid-cols-[1fr_180px_180px_auto] gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="搜索标题、描述或 Prompt..."
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        {promptStatusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="分类" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部分类</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setQuery("")
                        setStatusFilter("all")
                        setCategoryFilter("all")
                    }}
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重置
                </Button>
            </div>

            <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={toggleSelectAllFiltered} disabled={filteredPrompts.length === 0}>
                    {allFilteredSelected ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
                    {allFilteredSelected ? "取消当前筛选" : "选择当前筛选"}
                </Button>
                <span className="text-sm text-muted-foreground">已选 {selectedIds.length} 项</span>
                <Select value={batchStatus} onValueChange={setBatchStatus}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="批量状态" />
                    </SelectTrigger>
                    <SelectContent>
                        {promptStatusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={batchCategoryId} onValueChange={setBatchCategoryId}>
                    <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="批量分类" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="sm" onClick={applyBatchUpdate} disabled={selectedIds.length === 0 || batchLoading}>
                    应用修改
                </Button>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={deleteSelected} disabled={selectedIds.length === 0 || batchLoading}>
                    批量删除
                </Button>
            </div>

            <div className="divide-y divide-border">
                {filteredPrompts.map((prompt) => (
                    <div key={prompt.id} className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors group">
                        <button
                            type="button"
                            onClick={() => toggleSelection(prompt.id)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="选择 Prompt"
                        >
                            {selectedSet.has(prompt.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                            <Image
                                src={getPromptPreviewUrl(prompt)}
                                alt={prompt.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground truncate">{prompt.title}</h4>
                                <Link href={`/admin/edit/${prompt.id}`}>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                        <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{prompt.content.length > 190 ? prompt.content.slice(0, 190) + '...' : prompt.content}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadgeClass[prompt.status]}`}>
                                    {getPromptStatusLabel(prompt.status)}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                    {categoryNameMap.get(prompt.categoryId || "") || prompt.categoryId || "未分类"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {prompt.updatedAt ? new Date(prompt.updatedAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                            <div className="flex items-center gap-1.5" title="Views">
                                <Eye className="w-4 h-4" />
                                <span>{stats[prompt.id]?.views ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Copies">
                                <Copy className="w-4 h-4" />
                                <span>{stats[prompt.id]?.copies ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Likes">
                                <Heart className="w-4 h-4" />
                                <span>{stats[prompt.id]?.likes ?? 0}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleToggleStatus(prompt)}
                                disabled={updatingId === prompt.id || prompt.status === promptStatusIds.archived}
                            >
                                {prompt.status === appDefaults.prompt.status ? "转草稿" : "发布"}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setConfirmDeleteId(prompt.id)}
                                disabled={deletingId === prompt.id}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredPrompts.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>{prompts.length === 0 ? "暂无内容，点击右上角新建" : "没有匹配的内容"}</p>
                    </div>
                )}
            </div>

            <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作无法撤销。该 Prompt 将被永久删除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
