"use client"

import { ImageCard } from "@/components/image-card"
import { siteConfig } from "@/lib/config"
import { ImageModal } from "@/components/image-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTopPrompts } from "@/lib/data-utils"
import type { TimePeriod, Prompt } from "@/lib/types"
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
                const res = await fetch("/api/prompts")
                if (res.ok) {
                    const allPrompts: Prompt[] = await res.json()
                    // Client-side filtering for Top Prompts logic (Simulation)
                    // In real app, API should handle sorting params.
                    // Here we sort by views or copies based on mock logic or simple sort

                    // Simple logic: Sort by views for now as "Top"
                    const sorted = [...allPrompts].sort((a, b) => (b.views || 0) - (a.views || 0))
                    setTopPrompts(sorted.slice(0, 20))
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

    return (
        <div className="min-h-screen bg-background">
            <main className="w-full max-w-[2400px] mx-auto px-3 py-6">
                {/* Header */}
                <section className="text-center py-8 md:py-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
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
                                {topPrompts.map((prompt, index) => (
                                    <div key={prompt.id} className="masonry-item relative group">
                                        {index < 3 && (
                                            <div className="absolute top-2 left-2 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center text-sm shadow-lg pointer-events-none">
                                                {index + 1}
                                            </div>
                                        )}
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
