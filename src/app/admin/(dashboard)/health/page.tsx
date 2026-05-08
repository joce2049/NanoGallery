"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, AlertTriangle, CheckCircle2, Database, Images, RefreshCw, UploadCloud } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"

interface HealthData {
    generatedAt: string
    supabase: {
        configured: boolean
        promptStats: {
            ok: boolean
            count: number | null
            error?: { code?: string; message: string }
        }
        statEvents: {
            ok: boolean
            count: number | null
            error?: { code?: string; message: string }
        }
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
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${ok
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}>
            {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {label}
        </span>
    )
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
    return (
        <Card className="p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
            {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
        </Card>
    )
}

export default function AdminHealthPage() {
    const [health, setHealth] = useState<HealthData | null>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [generatingThumbs, setGeneratingThumbs] = useState(false)
    const [message, setMessage] = useState("")

    const loadHealth = async () => {
        setLoading(true)
        setMessage("")
        try {
            const res = await fetch("/api/admin/health")
            if (!res.ok) throw new Error("诊断数据加载失败")
            setHealth(await res.json())
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "诊断数据加载失败")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadHealth()
    }, [])

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
        setMessage("")
        try {
            const res = await fetch("/api/admin/sync-stats", { method: "POST" })
            const data = await res.json().catch(() => null)
            if (!res.ok) throw new Error(data?.error || "同步失败")
            setMessage(`已同步 ${data.synced} 条统计到 Supabase`)
            await loadHealth()
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "同步失败")
        } finally {
            setSyncing(false)
        }
    }

    const handleGenerateThumbnails = async () => {
        setGeneratingThumbs(true)
        setMessage("")
        try {
            const res = await fetch("/api/admin/generate-thumbnails", { method: "POST" })
            const data = await res.json().catch(() => null)
            if (!res.ok) throw new Error(data?.error || "缩略图生成失败")
            setMessage(`已生成 ${data.generated} 张缩略图，跳过 ${data.skipped} 张`)
            await loadHealth()
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "缩略图生成失败")
        } finally {
            setGeneratingThumbs(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        系统诊断
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">检查本地 JSON、标签、统计字段和 Supabase 对接状态。</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadHealth} disabled={loading || syncing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        刷新
                    </Button>
                    <Button onClick={handleSync} disabled={!health?.supabase.configured || syncing || loading}>
                        <UploadCloud className={`h-4 w-4 mr-2 ${syncing ? "animate-pulse" : ""}`} />
                        同步统计
                    </Button>
                    <Button variant="outline" onClick={handleGenerateThumbnails} disabled={generatingThumbs || loading}>
                        <Images className={`h-4 w-4 mr-2 ${generatingThumbs ? "animate-pulse" : ""}`} />
                        生成缩略图
                    </Button>
                </div>
            </div>

            {message && (
                <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                    {message}
                </div>
            )}

            {loading && !health ? (
                <Card className="p-8 text-center text-muted-foreground">正在检查系统状态...</Card>
            ) : health && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard label="Prompt" value={health.local.prompts} />
                        <MetricCard label="标签" value={health.local.tags} />
                        <MetricCard label="本地浏览" value={health.local.totals.views} detail={`${health.local.totals.copies} 复制 · ${health.local.totals.likes} 点赞`} />
                        <MetricCard label="缺缩略图" value={health.local.promptsMissingThumbnails.length} detail={`${health.local.promptsWithBrokenThumbnails.length} 个损坏路径`} />
                        <MetricCard label="远端统计行" value={health.supabase.remoteStatsRowsLoaded} detail={health.supabase.configured ? "Supabase 已配置" : "Supabase 未配置"} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Database className="h-5 w-5" />
                                    本地数据
                                </div>
                                <StatusPill ok={localDataOk} label={localDataOk ? "正常" : "需处理"} />
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">重复 Prompt ID</span><span>{health.local.duplicatePromptIds.length}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">未知标签</span><span>{health.local.unknownTags.length}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">缺失统计字段</span><span>{health.local.promptsMissingStats.length}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">缺失缩略图</span><span>{health.local.promptsMissingThumbnails.length}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">缩略图路径损坏</span><span>{health.local.promptsWithBrokenThumbnails.length}</span></div>
                            </div>
                            {health.local.unknownTags.length > 0 && (
                                <div className="text-xs text-muted-foreground break-words">未知标签：{health.local.unknownTags.join(", ")}</div>
                            )}
                        </Card>

                        <Card className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Database className="h-5 w-5" />
                                    Supabase
                                </div>
                                <StatusPill
                                    ok={health.supabase.configured && health.supabase.promptStats.ok && health.supabase.statEvents.ok}
                                    label={health.supabase.configured ? "已配置" : "未配置"}
                                />
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">prompt_stats</span><span>{health.supabase.promptStats.ok ? `${health.supabase.promptStats.count} 行` : "异常"}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">stat_events</span><span>{health.supabase.statEvents.ok ? `${health.supabase.statEvents.count} 行` : "异常"}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">远端缺失 Prompt</span><span>{health.supabase.remoteMissingPromptIds.length}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">远端低于本地</span><span>{health.supabase.remoteLowerThanLocal.length}</span></div>
                            </div>
                            {(health.supabase.promptStats.error || health.supabase.statEvents.error) && (
                                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
                                    {health.supabase.promptStats.error && <p>prompt_stats：{health.supabase.promptStats.error.message}</p>}
                                    {health.supabase.statEvents.error && <p>stat_events：{health.supabase.statEvents.error.message}</p>}
                                </div>
                            )}
                        </Card>
                    </div>

                    {(health.supabase.remoteMissingPromptIds.length > 0 || health.supabase.remoteLowerThanLocal.length > 0) && (
                        <Card className="overflow-hidden">
                            <div className="p-4 border-b bg-muted/50 font-medium">统计差异</div>
                            <div className="p-4 space-y-4 text-sm">
                                {health.supabase.remoteMissingPromptIds.length > 0 && (
                                    <div>
                                        <div className="font-medium mb-2">远端缺失 Prompt ID</div>
                                        <div className="text-muted-foreground break-words">{health.supabase.remoteMissingPromptIds.join(", ")}</div>
                                    </div>
                                )}
                                {health.supabase.remoteLowerThanLocal.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="font-medium">远端统计低于本地</div>
                                        {health.supabase.remoteLowerThanLocal.slice(0, 8).map(item => (
                                            <div key={item.id} className="rounded-md border border-border p-3">
                                                <div className="font-medium truncate">{item.title}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    本地 {item.local.views}/{item.local.copies}/{item.local.likes} · 远端 {item.remote.views}/{item.remote.copies}/{item.remote.likes}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
