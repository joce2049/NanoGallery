"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Copy, X, Heart, Sparkles, Terminal, Share2, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { Prompt, Tag } from "@/core/types"
import { getPromptTags, recordCopy, recordLike } from "@/core/data-utils"
import { TagList } from "@/features/tags/components/tag-badge"
import { StatsBadge } from "@/features/stats/components/stats-badge"
import { copyToClipboard, getImageUrl } from "@/shared/lib/utils"
import { toast } from "sonner"

interface ImageModalProps {
    prompt: Prompt | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelectPrompt?: (prompt: Prompt) => void
    allPrompts?: Prompt[]
    tags?: Tag[]
    onStatsChange?: (promptId: string, stats: { views: number; copies: number; likes: number }) => void
}

export function ImageModal({ prompt, open, onOpenChange, onSelectPrompt, allPrompts = [], tags = [], onStatsChange }: ImageModalProps) {
    const [activePrompt, setActivePrompt] = useState<Prompt | null>(prompt)
    const [promptLoading, setPromptLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [liked, setLiked] = useState(false)
    const [viewsCount, setViewsCount] = useState(0)
    const [copiesCount, setCopiesCount] = useState(0)
    const [likesCount, setLikesCount] = useState(0)
    const [promptScrollRef, setPromptScrollRef] = useState<HTMLDivElement | null>(null)
    const currentIndex = activePrompt ? allPrompts.findIndex(item => item.id === activePrompt.id) : -1
    const previousPrompt = currentIndex > 0 ? allPrompts[currentIndex - 1] : null
    const nextPrompt = currentIndex >= 0 && currentIndex < allPrompts.length - 1 ? allPrompts[currentIndex + 1] : null

    const selectPrompt = (next: Prompt | null) => {
        if (next && onSelectPrompt) {
            onSelectPrompt(next)
        }
    }

    useEffect(() => {
        setActivePrompt(prompt)
    }, [prompt])

    useEffect(() => {
        if (!open || !prompt || prompt.content) {
            setPromptLoading(false)
            return
        }

        const controller = new AbortController()
        setPromptLoading(true)

        fetch(`/api/prompts?id=${encodeURIComponent(prompt.id)}`, { signal: controller.signal })
            .then(res => res.ok ? res.json() : null)
            .then((data: Prompt | null) => {
                if (data) setActivePrompt(data)
            })
            .catch(error => {
                if (error instanceof DOMException && error.name === "AbortError") return
            })
            .finally(() => setPromptLoading(false))

        return () => controller.abort()
    }, [prompt?.id, prompt?.content, open])

    // Fetch stats and record view in a single API call when modal opens
    useEffect(() => {
        if (!open || !activePrompt) {
            return
        }

        if (promptScrollRef) {
            promptScrollRef.scrollTop = 0
        }
        setLiked(false)

        // Robust client-side deduplication using sessionStorage
        // This survives React StrictMode, remounts, and fast usage
        const storageKey = `view-timestamp-${activePrompt.id}`
        const lastViewTime = sessionStorage.getItem(storageKey)
        const now = Date.now()

        let shouldRecord = true
        // If viewed less than 5 seconds ago, don't record again
        if (lastViewTime && (now - parseInt(lastViewTime) < 5000)) {
            shouldRecord = false
        }

        if (shouldRecord) {
            sessionStorage.setItem(storageKey, now.toString())
        }

        const url = shouldRecord
            ? `/api/stats?promptId=${activePrompt.id}&recordView=true`
            : `/api/stats?promptId=${activePrompt.id}`

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const stats = {
                    views: data.views || 0,
                    copies: data.copies || 0,
                    likes: data.likes || 0,
                }
                setViewsCount(stats.views)
                setCopiesCount(stats.copies)
                setLikesCount(stats.likes)
                onStatsChange?.(activePrompt.id, stats)
            })
            .catch(() => {
                setViewsCount(0)
                setCopiesCount(0)
                setLikesCount(0)
            })
    }, [activePrompt?.id, open])

    useEffect(() => {
        if (!open) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onOpenChange(false)
            }
            if (event.key === "ArrowLeft") {
                selectPrompt(previousPrompt)
            }
            if (event.key === "ArrowRight") {
                selectPrompt(nextPrompt)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, previousPrompt?.id, nextPrompt?.id])

    if (!activePrompt) return null

    const promptTags = getPromptTags(activePrompt, tags)

    const handleCopyPrompt = async (e?: React.MouseEvent) => {
        e?.stopPropagation()

        try {
            if (!activePrompt.content) {
                toast.error("Prompt 正在加载，请稍后再试")
                return
            }

            const success = await copyToClipboard(activePrompt.content)

            if (success) {
                recordCopy(activePrompt.id)
                const nextStats = { views: viewsCount, copies: copiesCount + 1, likes: likesCount }
                setCopiesCount(nextStats.copies)
                onStatsChange?.(activePrompt.id, nextStats)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
                toast.success("Prompt 已复制")
            } else {
                toast.error("复制失败，请手动选择文本复制")
            }
        } catch (error) {
            console.error('❌ Copy error:', error)
            toast.error("复制出错，请手动选择文本复制")
        }
    }

    const handleLike = () => {
        if (!liked) {
            setLiked(true)
            const nextStats = { views: viewsCount, copies: copiesCount, likes: likesCount + 1 }
            setLikesCount(nextStats.likes)
            onStatsChange?.(activePrompt.id, nextStats)
            recordLike(activePrompt.id)
            toast.success("已点赞")
        } else {
            setLiked(false)
            const nextStats = { views: viewsCount, copies: copiesCount, likes: Math.max(0, likesCount - 1) }
            setLikesCount(nextStats.likes)
            onStatsChange?.(activePrompt.id, nextStats)
            toast("已取消点赞")
            // Optional: recordUnlike if API supports it
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="!max-w-[95vw] !w-full md:!max-w-[1600px] !h-[92vh] p-0 gap-0 outline-none border border-white/30 dark:border-white/10 shadow-2xl shadow-slate-900/15 overflow-hidden rounded-xl bg-white/72 dark:bg-zinc-950/76 backdrop-blur-2xl"
                showCloseButton={false}
            >
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px] lg:grid-cols-[minmax(0,1fr)_420px] grid-rows-[38vh_minmax(0,1fr)] md:grid-rows-1 h-full min-h-0 w-full overflow-hidden">
                    {/* Left Panel: Image (Fixed/Centered) */}
                    <div className="relative h-full md:h-full min-h-0 w-full bg-muted/20 flex items-center justify-center p-3 md:p-6 overflow-hidden group">

                        {/* Ambient Background Blur */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <Image
                                src={getImageUrl(activePrompt.imageUrl) || "/placeholder.svg"}
                                alt=""
                                fill
                                className="object-cover blur-3xl opacity-20 scale-110"
                                priority
                            />
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center z-10">
                            <Image
                                src={getImageUrl(activePrompt.imageUrl) || "/placeholder.svg"}
                                alt={activePrompt.title}
                                fill
                                className="object-contain max-h-full max-w-full"
                                sizes="(max-width: 768px) 100vw, 80vw"
                                priority
                            />
                        </div>


                        {/* Close button for Desktop - floating on image area */}
                        {previousPrompt && (
                            <button
                                onClick={() => selectPrompt(previousPrompt)}
                                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-2.5 md:p-3 rounded-full bg-black/20 hover:bg-black/30 text-white md:text-foreground/80 md:hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 transition-all md:opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-md z-50"
                                aria-label="上一张"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}
                        {nextPrompt && (
                            <button
                                onClick={() => selectPrompt(nextPrompt)}
                                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2.5 md:p-3 rounded-full bg-black/20 hover:bg-black/30 text-white md:text-foreground/80 md:hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 transition-all md:opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-md z-50"
                                aria-label="下一张"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        )}

                        {/* Close button for Desktop - floating on image area */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-6 left-6 p-3 rounded-full bg-black/10 hover:bg-black/20 text-foreground/80 hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 dark:text-foreground/80 dark:hover:text-foreground transition-all md:block hidden opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-md z-50"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Close button for Mobile - always visible, higher z-index */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="md:hidden fixed top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-md z-[100] shadow-lg"
                            aria-label="关闭"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Right Panel: Fixed information with prompt-only scrolling */}
                    <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/30 dark:border-white/10 min-h-0 bg-white/72 dark:bg-zinc-950/76 backdrop-blur-2xl h-full overflow-hidden">

                        {/* Mobile Close Bar */}


                        {/* Fixed Content */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <div className="h-full p-4 md:p-8 flex flex-col gap-4 md:gap-6 overflow-hidden">
                                {/* Header */}
                                <div className="space-y-4 shrink-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <DialogTitle className="text-xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">
                                            {activePrompt.title}
                                        </DialogTitle>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`rounded-full hover:bg-pink-500/10 hover:text-pink-500 transition-colors ${liked ? "text-pink-500 bg-pink-500/10" : ""}`}
                                                onClick={handleLike}
                                            >
                                                <Heart className={`h-5 w-5 md:h-6 md:w-6 ${liked ? "fill-current" : ""}`} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <Share2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                    {activePrompt.description && (
                                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-2">{activePrompt.description}</p>
                                    )}
                                </div>

                                {/* Metadata Pills */}
                                {activePrompt.metadata && (
                                    <div className="flex flex-wrap gap-2 shrink-0">
                                        {activePrompt.metadata.aspectRatio && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border/50 text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 mr-2" />
                                                {activePrompt.metadata.aspectRatio}
                                            </span>
                                        )}
                                        {activePrompt.metadata.model && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border/50 text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2" />
                                                {activePrompt.metadata.model}
                                            </span>
                                        )}
                                        {activePrompt.metadata.style && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border/50 text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white border border-slate-300 mr-2" />
                                                {activePrompt.metadata.style}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Prompt Content (Code Style) */}
                                <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Terminal className="h-4 w-4" />
                                            Prompt
                                        </h3>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">ENGLISH</span>
                                        </div>
                                    </div>
                                    <div className="relative group flex-1 min-h-[160px] md:min-h-0">
                                        <div
                                            className="h-full max-h-full bg-muted rounded-lg p-4 md:p-5 font-mono text-xs md:text-sm leading-relaxed text-foreground shadow-inner border border-border overflow-x-auto overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/60"
                                            ref={setPromptScrollRef}
                                        >
                                            {promptLoading ? (
                                                <div className="flex h-full min-h-[120px] items-center justify-center gap-2 text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>正在加载 Prompt...</span>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap break-words">
                                                    {activePrompt.content || "暂无 Prompt 内容"}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity h-8 w-8 z-10"
                                            onClick={handleCopyPrompt}
                                            disabled={promptLoading || !activePrompt.content}
                                            aria-label="复制 Prompt"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Tags */}
                                {promptTags.length > 0 && (
                                    <div className="space-y-3 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
                                        </div>
                                        <TagList tags={promptTags} size="sm" />
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-muted-foreground text-sm shrink-0">
                                    <StatsBadge views={viewsCount} copies={copiesCount} likes={likesCount} />
                                    <span className="text-xs">ID: {activePrompt.id.slice(0, 8)}</span>
                                </div>


                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-3 md:p-6 border-t border-white/30 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl flex flex-col gap-3 shrink-0">
                            <Button
                                size="lg"
                                className="w-full font-semibold h-11 md:h-12 text-sm md:text-base shadow-lg shadow-cyan-100/20 bg-gradient-to-r from-slate-200 via-white to-cyan-100 hover:from-white hover:via-slate-100 hover:to-cyan-50 text-slate-950 border-0"
                                onClick={handleCopyPrompt}
                                disabled={promptLoading || !activePrompt.content}
                            >
                                <Sparkles className="h-5 w-5 mr-2" />
                                {copied ? "Copied to Clipboard!" : "Generate with this Prompt"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
