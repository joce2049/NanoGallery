"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, AlertTriangle, CheckCircle2, Database, Images, RefreshCw, UploadCloud } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { AdminPanel, AdminStat } from "@/features/admin/components/admin-panel"
import { adminUi, statusPillStyles } from "@/config"
import { toast } from "sonner"

interface HealthData {
    generatedAt: string
    supabase: {
        configured: boolean
        promptStats: { ok: boolean; count: number | null; error?: { code?: string; message: string } }
        statEvents: { ok: boolean; count: number | null; error?: { code?: string; message: string } }
        remoteStatsRowsLoaded: number
        recentEvents: Array<{ prompt_id: string; event_type: string; created_at: string }>
        remoteMissingPromptIds: string[]
        remoteLowerThanLocal: Array<{
            id: string
            title: string
            local: { views: number; copies: number; likes: number }
            remote: { views: number; copies: number; likes: number }
        }>
    }
    local: {
        prompts: number
        tags: number
        duplicatePromptIds: string[]
        unknownTags: string[]
        promptsMissingStats: string[]
        promptsMissingThumbnails: string[]
        promptsWithBrokenThumbnails: string[]
        totals: { views: number; copies: number; likes: number }
    }
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${ok ? statusPillStyles.ok : statusPillStyles.warn}`}>
            {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {label}
        </span>
    )
}

export default function AdminHealthPage() {
    const [health, setHealth] = useState<HealthData | null>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [generatingThumbs, setGeneratingThumbs] = useState(false)

    const loadHealth = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/health")
            if (!res.ok) throw new Error("诊断数据加载失败")
            setHealth(await res.json())
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "诊断数据加载失败")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadHealth() }, [])

    const localDataOk = useMemo(() => {
        if (!health) return false
        return (
            health.local.duplicatePromptIds.length === 0 &&
            health.local.unknownTags.length === 0 &&
            health.local.promptsMissingStats.length === 0 &&
            health.local.promptsWithBrokenThumbnails.length === 0
        )
    }, [health])

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await fetch("/api/admin/sync-stats", { method: "POST" })
            const data = await res.json().catch(() => null)
            if (!res.ok) throw new Error(data?.error || "同步失败")
            toast.success(`已同步 ${data.synced} 条统计到 Supabase`)
            await loadHealth()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "同步失败")
        } finally {
            setSyncing(false)
        }
    }

    const handleGenerateThumbnails = async () => {
        setGeneratingThumbs(true)
        try {
            const res = await fetch("/api/admin/generate-thumbnails", { method: "POST" })
            const data = await res.json().catch(() => null)
            if (!res.ok) throw new Error(data?.error || "缩略图生成失败")
            const failed = Array.isArray(data.failed) ? data.failed.length : 0
            const msg = `已生成 ${data.generated} 张缩略图，跳过 ${data.skipped} 张` + (failed ? `，失败 ${failed} 张` : "")
            if (failed) toast.warning(msg)
            else toast.success(msg)
            await loadHealth()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "缩略图生成失败")
        } finally {
            setGeneratingThumbs(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <Activity className="h-6 w-6" />
                        系统诊断
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">检查本地 JSON、标签、统计字段和 Supabase 对接状态。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={loadHealth} disabled={loading || syncing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />刷新
                    </Button>
                    <Button onClick={handleSync} disabled={!health?.supabase.configured || syncing || loading}>
                        <UploadCloud className={`mr-2 h-4 w-4 ${syncing ? "animate-pulse" : ""}`} />同步统计
                    </Button>
                    <Button variant="outline" onClick={handleGenerateThumbnails} disabled={generatingThumbs || loading}>
                        <Images className={`mr-2 h-4 w-4 ${generatingThumbs ? "animate-pulse" : ""}`} />生成缩略图
                    </Button>
                </div>
            </div>

            {loading && !health ? (
                <div className="rounded-lg bg-muted/40 p-8 text-center text-muted-foreground">正在检查系统状态...</div>
            ) : health && (
                <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                        <AdminStat label="Prompt" value={health.local.prompts} />
                        <AdminStat label="标签" value={health.local.tags} />
                        <AdminStat label="本地浏览" value={health.local.totals.views} detail={`${health.local.totals.copies} 复制 · ${health.local.totals.likes} 点赞`} />
                        <AdminStat label="缺缩略图" value={health.local.promptsMissingThumbnails.length} detail={`${health.local.promptsWithBrokenThumbnails.length} 个损坏路径`} />
                        <AdminStat label="远端统计行" value={health.supabase.remoteStatsRowsLoaded} detail={health.supabase.configured ? "Supabase 已配置" : "Supabase 未配置"} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <AdminPanel
                            title={<span className="flex items-center gap-2"><Database className="h-4 w-4" />本地数据</span>}
                            action={<StatusPill ok={localDataOk} label={localDataOk ? "正常" : "需处理"} />}
                            bodyClassName="space-y-2 text-sm"
                        >
                            <div className="flex justify-between"><span className="text-muted-foreground">重复 Prompt ID</span><span>{health.local.duplicatePromptIds.length}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">未知标签</span><span>{health.local.unknownTags.length}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">缺失统计字段</span><span>{health.local.promptsMissingStats.length}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">缺失缩略图</span><span>{health.local.promptsMissingThumbnails.length}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">缩略图路径损坏</span><span>{health.local.promptsWithBrokenThumbnails.length}</span></div>
                            {health.local.unknownTags.length > 0 && (
                                <div className="break-words pt-1 text-xs text-muted-foreground">未知标签：{health.local.unknownTags.join(", ")}</div>
                            )}
                        </AdminPanel>

                        <AdminPanel
                            title={<span className="flex items-center gap-2"><Database className="h-4 w-4" />Supabase</span>}
                            action={<StatusPill ok={health.supabase.configured && health.supabase.promptStats.ok && health.supabase.statEvents.ok} label={health.supabase.configured ? "已配置" : "未配置"} />}
                            bodyClassName="space-y-2 text-sm"
                        >
                            <div className="flex justify-between"><span className="text-muted-foreground">prompt_stats</span><span>{health.supabase.promptStats.ok ? `${health.supabase.promptStats.count} 行` : "异常"}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">stat_events</span><span>{health.supabase.statEvents.ok ? `${health.supabase.statEvents.count} 行` : "异常"}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">远端缺失 Prompt</span><span>{health.supabase.remoteMissingPromptIds.length}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">远端低于本地</span><span>{health.supabase.remoteLowerThanLocal.length}</span></div>
                            {(health.supabase.promptStats.error || health.supabase.statEvents.error) && (
                                <div className="space-y-1 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                                    {health.supabase.promptStats.error && <p>prompt_stats：{health.supabase.promptStats.error.message}</p>}
                                    {health.supabase.statEvents.error && <p>stat_events：{health.supabase.statEvents.error.message}</p>}
                                </div>
                            )}
                        </AdminPanel>
                    </div>

                    {(health.supabase.remoteMissingPromptIds.length > 0 || health.supabase.remoteLowerThanLocal.length > 0) && (
                        <AdminPanel title="统计差异" flush>
                            <div className="space-y-4 p-4 text-sm">
                                {health.supabase.remoteMissingPromptIds.length > 0 && (
                                    <div>
                                        <div className="mb-2 font-medium">远端缺失 Prompt ID</div>
                                        <div className="break-words text-muted-foreground">{health.supabase.remoteMissingPromptIds.join(", ")}</div>
                                    </div>
                                )}
                                {health.supabase.remoteLowerThanLocal.length > 0 && (
                                    <div>
                                        <div className="mb-2 font-medium">远端统计低于本地</div>
                                        <div className="divide-y divide-border rounded-lg bg-muted/30">
                                            {health.supabase.remoteLowerThanLocal.slice(0, adminUi.healthDiffLimit).map(item => (
                                                <div key={item.id} className="p-3">
                                                    <div className="truncate font-medium">{item.title}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        本地 {item.local.views}/{item.local.copies}/{item.local.likes} · 远端 {item.remote.views}/{item.remote.copies}/{item.remote.likes}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {health.supabase.remoteLowerThanLocal.length > adminUi.healthDiffLimit && (
                                            <p className="mt-2 text-xs text-muted-foreground">还有 {health.supabase.remoteLowerThanLocal.length - adminUi.healthDiffLimit} 项未显示，可执行「同步统计」修复。</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </AdminPanel>
                    )}
                </>
            )}
        </div>
    )
}
