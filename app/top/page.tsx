"use client"

import { ImageCard } from "@/components/image-card"
import { siteConfig } from "@/lib/config"
import { ImageModal } from "@/components/image-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TimePeriod, Prompt, Tag } from "@/lib/types"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function TopPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlPeriod = searchParams.get("period") as TimePeriod
    const [period, setPeriod] = useState<TimePeriod>(urlPeriod || "week")
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [topPrompts, setTopPrompts] = useState<Prompt[]>([])
    const [tags, setTags] = useState<Tag[]>([])

    // Sync state when URL param changes
    useEffect(() => {
        if (urlPeriod && ["today", "week", "month"].includes(urlPeriod)) {
            setPeriod(urlPeriod)
        }
    }, [urlPeriod])

    // Update URL when tab changes
    const handlePeriodChange = (val: string) => {
        const newPeriod = val as TimePeriod
        setPeriod(newPeriod)
        router.push(`/top?period=${newPeriod}`)
    }

    // Dynamic Title Logic
    const getTitle = () => {
        switch (period) {
            case "today": return "今日 Prompts"
            case "week": return "本周 Prompts"
            case "month": return "本月 Prompts"
            default: return "热门榜单"
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [promptsRes, tagsRes] = await Promise.all([
                    fetch(`/api/prompts?sort=popular&period=${period}&limit=20`),
                    fetch("/api/tags"),
                ])

                if (promptsRes.ok) {
                    const prompts: Prompt[] = await promptsRes.json()
                    setTopPrompts(prompts)
                }

                if (tagsRes.ok) {
                    const tagData: Tag[] = await tagsRes.json()
                    setTags(tagData)
                }
            } catch (e) {
                console.error("Failed to fetch top prompts", e)
            }
        }

        fetchData()
    }, [period])

    const handleCardClick = (prompt: Prompt) => {
        setSelectedPrompt(prompt)
        setModalOpen(true)
    }

    const handleStatsChange = (promptId: string, stats: { views: number; copies: number; likes: number }) => {
        setTopPrompts(current => current.map(prompt => (
            prompt.id === promptId ? { ...prompt, ...stats } : prompt
        )))
        setSelectedPrompt(current => (
            current?.id === promptId ? { ...current, ...stats } : current
        ))
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="w-full max-w-[2400px] mx-auto px-3 py-6">
                {/* Header */}
                <section className="text-center py-8 md:py-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-slate-900 via-slate-500 to-cyan-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-cyan-100">
                        {getTitle()}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                        发现最受欢迎的 AI Prompts，获取灵感
                    </p>
                </section>

                {/* Tabs */}
                <Tabs value={period} onValueChange={handlePeriodChange} className="mb-8">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                        <TabsTrigger value="today">今日</TabsTrigger>
                        <TabsTrigger value="week">本周</TabsTrigger>
                        <TabsTrigger value="month">本月</TabsTrigger>
                    </TabsList>

                    {["today", "week", "month"].map((tabValue) => (
                        <TabsContent key={tabValue} value={tabValue} className="mt-8">
                            <div className="masonry-grid">
                                {topPrompts.map((prompt) => (
                                    <div key={prompt.id} className="masonry-item relative group">
                                        <ImageCard
                                            prompt={prompt}
                                            onCardClick={() => handleCardClick(prompt)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </main>

            {/* Image Modal */}
            <ImageModal
                prompt={selectedPrompt}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSelectPrompt={setSelectedPrompt}
                allPrompts={topPrompts}
                tags={tags}
                onStatsChange={handleStatsChange}
            />

            {/* Footer */}
            <footer className="border-t border-border/40 mt-20 py-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p className="text-sm">© {siteConfig.copyright.year} {siteConfig.name}. {siteConfig.copyright.text}。</p>
                </div>
            </footer>
        </div>
    )
}
