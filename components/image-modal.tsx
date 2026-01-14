"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, X, Heart, Sparkles, Terminal, Share2, Check } from "lucide-react"
import type { Prompt } from "@/lib/types"
import { getPromptTags, getRelatedPrompts, recordCopy, recordLike } from "@/lib/data-utils"
import { TagList } from "@/components/tag-badge"
import { StatsBadge } from "@/components/stats-badge"
import { ImageCard } from "@/components/image-card"
import { copyToClipboard, getImageUrl } from "@/lib/utils"

interface ImageModalProps {
    prompt: Prompt | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelectPrompt?: (prompt: Prompt) => void
}

export function ImageModal({ prompt, open, onOpenChange, onSelectPrompt }: ImageModalProps) {
    const [copied, setCopied] = useState(false)
    const [liked, setLiked] = useState(false)
    const [viewsCount, setViewsCount] = useState(0)
    const [copiesCount, setCopiesCount] = useState(0)
    const [likesCount, setLikesCount] = useState(0)
    const [scrollAreaRef, setScrollAreaRef] = useState<HTMLDivElement | null>(null)

    // Fetch stats and record view in a single API call when modal opens
    useEffect(() => {
        if (!open || !prompt) {
            return
        }

        // Scroll to top
        if (scrollAreaRef) {
            scrollAreaRef.scrollTop = 0
        }
        setLiked(false)

        // Robust client-side deduplication using sessionStorage
        // This survives React StrictMode, remounts, and fast usage
        const storageKey = `view-timestamp-${prompt.id}`
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
            ? `/api/stats?promptId=${prompt.id}&recordView=true`
            : `/api/stats?promptId=${prompt.id}`

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setViewsCount(data.views || 0)
                setCopiesCount(data.copies || 0)
                setLikesCount(data.likes || 0)
            })
            .catch(() => {
                setViewsCount(0)
                setCopiesCount(0)
                setLikesCount(0)
            })
    }, [prompt?.id, open])

    if (!prompt) return null

    const tags = getPromptTags(prompt)
    const relatedPrompts = getRelatedPrompts(prompt, 6)

    const handleCopyPrompt = async (e?: React.MouseEvent) => {
        e?.stopPropagation()
        const success = await copyToClipboard(prompt.content)
        if (success) {
            recordCopy(prompt.id)
            setCopiesCount(prev => prev + 1)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleLike = () => {
        if (!liked) {
            setLiked(true)
            setLikesCount(prev => prev + 1)
            recordLike(prompt.id)
        } else {
            setLiked(false)
            setLikesCount(prev => prev - 1)
            // Optional: recordUnlike if API supports it
        }
    }

    const handleRelatedClick = (relatedPrompt: Prompt) => {
        if (onSelectPrompt) {
            onSelectPrompt(relatedPrompt)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="!max-w-[95vw] !w-full md:!max-w-[1600px] !h-[92vh] p-0 gap-0 outline-none border-0 shadow-2xl overflow-hidden rounded-xl bg-background"
                showCloseButton={false}
            >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px] h-full w-full">
                    {/* Left Panel: Image (Fixed/Centered) */}
                    <div className="relative h-[35vh] md:h-full w-full bg-muted/20 flex items-center justify-center p-4 md:p-6 overflow-hidden group">

                        {/* Ambient Background Blur */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <Image
                                src={getImageUrl(prompt.imageUrl) || "/placeholder.svg"}
                                alt=""
                                fill
                                className="object-cover blur-3xl opacity-20 scale-110"
                                priority
                            />
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center z-10">
                            <Image
                                src={getImageUrl(prompt.imageUrl) || "/placeholder.svg"}
                                alt={prompt.title}
                                fill
                                className="object-contain shadow-2xl drop-shadow-2xl"
                                sizes="(max-width: 768px) 100vw, 80vw"
                                priority
                            />
                        </div>

                        {/* Close button for Desktop - floating on image area */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-6 left-6 p-3 rounded-full bg-black/10 hover:bg-black/20 text-foreground/80 hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 dark:text-foreground/80 dark:hover:text-foreground transition-all md:block hidden opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-md z-50"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Right Panel: Information (Scrollable + Sticky Footer) */}
                    <div className="flex flex-col border-l border-border min-h-0 bg-background h-full overflow-hidden">

                        {/* Mobile Close Bar */}


                        {/* Scrollable Content */}
                        <div
                            className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/60"
                            ref={setScrollAreaRef}
                        >
                            <div className="p-6 md:p-8 space-y-8">
                                {/* Header */}
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">
                                            {prompt.title}
                                        </DialogTitle>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`rounded-full hover:bg-pink-500/10 hover:text-pink-500 transition-colors ${liked ? "text-pink-500 bg-pink-500/10" : ""}`}
                                                onClick={handleLike}
                                            >
                                                <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <Share2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                    {prompt.description && (
                                        <p className="text-muted-foreground text-base leading-relaxed">{prompt.description}</p>
                                    )}
                                </div>

                                {/* Metadata Pills */}
                                {prompt.metadata && (
                                    <div className="flex flex-wrap gap-2">
                                        {prompt.metadata.aspectRatio && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border/50 text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                                                {prompt.metadata.aspectRatio}
                                            </span>
                                        )}
                                        {prompt.metadata.model && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border/50 text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />
                                                {prompt.metadata.model}
                                            </span>
                                        )}
                                        {prompt.metadata.style && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border/50 text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                                                {prompt.metadata.style}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Prompt Content (Code Style) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Terminal className="h-4 w-4" />
                                            Prompt
                                        </h3>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">ENGLISH</span>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <div className="bg-muted rounded-lg p-5 font-mono text-xs md:text-sm leading-relaxed text-foreground shadow-inner border border-border overflow-x-auto overflow-y-auto max-h-[300px]">
                                            <p className="whitespace-pre-wrap break-words">{prompt.content}</p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 z-10"
                                            onClick={handleCopyPrompt}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Tags */}
                                {tags.length > 0 && (
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
                                        </div>
                                        <TagList tags={tags} size="sm" />
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-muted-foreground text-sm">
                                    <StatsBadge views={viewsCount} copies={copiesCount} likes={likesCount} />
                                    <span className="text-xs">ID: {prompt.id.slice(0, 8)}</span>
                                </div>


                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-4 md:p-6 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex flex-col gap-3 shrink-0">
                            <Button
                                size="lg"
                                className="w-full font-semibold h-12 text-base shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                                onClick={handleCopyPrompt}
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
