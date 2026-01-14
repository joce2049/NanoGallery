
"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, Copy, Heart, Image as ImageIcon, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Prompt } from "@/lib/types"
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
} from "@/components/ui/alert-dialog"

interface AdminPromptListProps {
    initialPrompts: Prompt[]
}

interface PromptStats {
    views: number
    copies: number
    likes: number
}

export function AdminPromptList({ initialPrompts }: AdminPromptListProps) {
    const router = useRouter()
    const [prompts, setPrompts] = useState(initialPrompts)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [stats, setStats] = useState<Record<string, PromptStats>>({})

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
        } catch (e) {
            alert("Error deleting")
        } finally {
            setDeletingId(null)
            setConfirmDeleteId(null)
        }
    }

    return (
        <>
            <div className="divide-y divide-border">
                {prompts.map((prompt) => (
                    <div key={prompt.id} className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors group">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                            <Image
                                src={prompt.imageUrl || "/placeholder.svg"}
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
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${prompt.status === 'published'
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
                                    : 'bg-secondary text-secondary-foreground border-border'
                                    }`}>
                                    {prompt.status === 'published' ? '已发布' : '草稿'}
                                </span>
                                <span className="text-xs text-muted-foreground">{new Date(prompt.createdAt).toLocaleDateString()}</span>
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
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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

                {prompts.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>暂无内容，点击右上角新建</p>
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
