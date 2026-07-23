"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, Copy, Heart, Image as ImageIcon, Edit, Trash2, Search, RotateCcw, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { Category, Prompt } from "@/core/types"
import { getPromptPreviewUrl } from "@/shared/lib/utils"
import { adminUi, appDefaults, getPromptStatusLabel, promptStatusIds, promptStatusOptions, promptStatusStyles, uiText } from "@/config"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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

const KEEP = "__keep__" // 批量下拉「不修改」的哨兵值

export function AdminPromptList({ initialPrompts }: AdminPromptListProps) {
    const router = useRouter()
    const [prompts, setPrompts] = useState(initialPrompts)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)
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
    const [page, setPage] = useState(1)

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.ok ? res.json() : [])
            .then((data: Category[]) => setCategories(data))
            .catch(() => setCategories([]))
    }, [])

    const categoryNameMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories])

    const filteredPrompts = useMemo(() => prompts.filter(prompt => {
        const lowerQuery = query.trim().toLowerCase()
        const matchesQuery = !lowerQuery ||
            prompt.title.toLowerCase().includes(lowerQuery) ||
            prompt.content.toLowerCase().includes(lowerQuery) ||
            prompt.description?.toLowerCase().includes(lowerQuery)
        const matchesStatus = statusFilter === "all" || prompt.status === statusFilter
        const matchesCategory = categoryFilter === "all" || prompt.categoryId === categoryFilter
        return matchesQuery && matchesStatus && matchesCategory
    }), [prompts, query, statusFilter, categoryFilter])

    // 筛选变化时回到第一页
    useEffect(() => { setPage(1) }, [query, statusFilter, categoryFilter])

    const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / adminUi.listPageSize))
    const currentPage = Math.min(page, totalPages)
    const pagedPrompts = filteredPrompts.slice((currentPage - 1) * adminUi.listPageSize, currentPage * adminUi.listPageSize)

    // 只为当前页拉取统计，避免把所有 ID 拼进一个超长 URL
    const pagedIdsKey = pagedPrompts.map(p => p.id).join(",")
    useEffect(() => {
        if (!pagedIdsKey) return
        fetch(`/api/stats/batch?promptIds=${pagedIdsKey}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.stats) setStats(prev => ({ ...prev, ...data.stats })) })
            .catch(() => undefined)
    }, [pagedIdsKey])

    const filteredIds = filteredPrompts.map(prompt => prompt.id)
    const selectedSet = new Set(selectedIds)
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedSet.has(id))

    const toggleSelection = (id: string) => {
        setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
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
        if (!batchStatus && !batchCategoryId) {
            toast.error("请选择要批量修改的状态或分类")
            return
        }

        const payload: { ids: string[]; status?: string; categoryId?: string } = { ids: selectedIds }
        if (batchStatus) payload.status = batchStatus
        if (batchCategoryId) payload.categoryId = batchCategoryId

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
            toast.success(`已更新 ${data.updated.length} 个 Prompt`)
            setBatchStatus("")
            setBatchCategoryId("")
            setSelectedIds([])
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "批量更新失败")
        } finally {
            setBatchLoading(false)
        }
    }

    const deleteSelected = async () => {
        if (selectedIds.length === 0) return
        setBatchLoading(true)
        try {
            const res = await fetch("/api/prompts/batch", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
            })
            if (!res.ok) throw new Error("批量删除失败")

            const count = selectedIds.length
            setPrompts(current => current.filter(prompt => !selectedIds.includes(prompt.id)))
            setSelectedIds([])
            toast.success(`已删除 ${count} 个 Prompt`)
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "批量删除失败")
        } finally {
            setBatchLoading(false)
            setConfirmBatchDelete(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const res = await fetch(`/api/prompts?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setPrompts(prompts.filter(p => p.id !== id))
                toast.success("已删除")
                router.refresh()
            } else {
                toast.error("删除失败")
            }
        } catch {
            toast.error("删除出错")
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
                toast.success(nextStatus === appDefaults.prompt.status ? "已发布" : "已转草稿")
                router.refresh()
            } else {
                const data = await res.json().catch(() => null)
                toast.error(data?.error || "状态更新失败")
            }
        } catch {
            toast.error("状态更新出错")
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <>
            {/* 筛选 */}
            <div className="grid grid-cols-1 gap-3 border-b border-border bg-background/60 p-4 lg:grid-cols-[1fr_180px_180px_auto]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标题、描述或 Prompt..." className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        {promptStatusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue placeholder="分类" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部分类</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setQuery(""); setStatusFilter("all"); setCategoryFilter("all") }}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {uiText.buttons.reset}
                </Button>
            </div>

            {/* 批量操作 */}
            <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 p-4">
                <Button variant="outline" size="sm" onClick={toggleSelectAllFiltered} disabled={filteredPrompts.length === 0}>
                    {allFilteredSelected ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                    {allFilteredSelected ? "取消当前筛选" : "选择当前筛选"}
                </Button>
                <span className="text-sm text-muted-foreground">已选 {selectedIds.length} 项</span>
                <Select value={batchStatus || KEEP} onValueChange={(v) => setBatchStatus(v === KEEP ? "" : v)}>
                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={KEEP}>不修改状态</SelectItem>
                        {promptStatusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={batchCategoryId || KEEP} onValueChange={(v) => setBatchCategoryId(v === KEEP ? "" : v)}>
                    <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={KEEP}>不修改分类</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="sm" onClick={applyBatchUpdate} disabled={selectedIds.length === 0 || batchLoading}>应用修改</Button>
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirmBatchDelete(true)} disabled={selectedIds.length === 0 || batchLoading}>批量删除</Button>
            </div>

            {/* 列表 */}
            <div className="divide-y divide-border">
                {pagedPrompts.map((prompt) => (
                    <div key={prompt.id} className="group flex items-center gap-4 p-4 transition-colors hover:bg-accent/50">
                        <button type="button" onClick={() => toggleSelection(prompt.id)} className="text-muted-foreground hover:text-foreground" aria-label="选择 Prompt">
                            {selectedSet.has(prompt.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>

                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image src={getPromptPreviewUrl(prompt)} alt={prompt.title} fill className="object-cover" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="truncate font-medium text-foreground">{prompt.title}</h4>
                                <Link href={`/admin/edit/${prompt.id}`}>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                                {prompt.content.length > adminUi.listContentPreview ? prompt.content.slice(0, adminUi.listContentPreview) + "..." : prompt.content}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className={`rounded-full border px-2 py-0.5 text-xs ${promptStatusStyles[prompt.status]}`}>
                                    {getPromptStatusLabel(prompt.status)}
                                </span>
                                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    {categoryNameMap.get(prompt.categoryId || "") || prompt.categoryId || "未分类"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {prompt.updatedAt ? new Date(prompt.updatedAt).toLocaleDateString() : "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5" title="浏览"><Eye className="h-4 w-4" /><span>{stats[prompt.id]?.views ?? 0}</span></div>
                            <div className="flex items-center gap-1.5" title="复制"><Copy className="h-4 w-4" /><span>{stats[prompt.id]?.copies ?? 0}</span></div>
                            <div className="flex items-center gap-1.5" title="点赞"><Heart className="h-4 w-4" /><span>{stats[prompt.id]?.likes ?? 0}</span></div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {prompt.status !== promptStatusIds.archived && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleToggleStatus(prompt)}
                                    disabled={updatingId === prompt.id}
                                >
                                    {prompt.status === appDefaults.prompt.status ? "转草稿" : "发布"}
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setConfirmDeleteId(prompt.id)}
                                disabled={deletingId === prompt.id}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredPrompts.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <ImageIcon className="mx-auto mb-4 h-12 w-12 opacity-20" />
                        <p>{prompts.length === 0 ? uiText.empty.noContent : uiText.empty.noResults}</p>
                    </div>
                )}
            </div>

            {/* 分页 */}
            {filteredPrompts.length > adminUi.listPageSize && (
                <div className="flex items-center justify-between gap-4 border-t border-border p-4 text-sm text-muted-foreground">
                    <span>共 {filteredPrompts.length} 项 · 第 {currentPage}/{totalPages} 页</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                            <ChevronLeft className="mr-1 h-4 w-4" />上一页
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                            下一页<ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* 单个删除确认 */}
            <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除？</AlertDialogTitle>
                        <AlertDialogDescription>此操作无法撤销。该 Prompt 将被永久删除。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{uiText.buttons.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)} className="bg-destructive text-white hover:bg-destructive/90">
                            {uiText.buttons.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 批量删除确认 */}
            <AlertDialog open={confirmBatchDelete} onOpenChange={setConfirmBatchDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认批量删除？</AlertDialogTitle>
                        <AlertDialogDescription>将永久删除选中的 {selectedIds.length} 个 Prompt，此操作无法撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{uiText.buttons.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteSelected} disabled={batchLoading} className="bg-destructive text-white hover:bg-destructive/90">
                            {uiText.buttons.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
