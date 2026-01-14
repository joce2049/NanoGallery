"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ImageCard } from "@/components/image-card"
import { ImageModal } from "./image-modal"
import { JSONFileDB } from "@/lib/db"
import { siteConfig, uiText } from "@/lib/config"
import { getAllCategories, sortPrompts, paginatePrompts, recordView, getPromptsByTag, getTagBySlug } from "@/lib/data-utils"
import type { Prompt, SortBy } from "@/lib/types"
import { useSearchParams } from "next/navigation"

interface ClientGalleryProps {
    initialPrompts: Prompt[]
    periodStats?: {
        today: Map<string, number>
        week: Map<string, number>
        month: Map<string, number>
    }
}

export function ClientGallery({ initialPrompts, periodStats }: ClientGalleryProps) {
    const searchParams = useSearchParams()
    const categoryParam = searchParams.get("category")
    const tagParam = searchParams.get("tag")

    const [sortBy, setSortBy] = useState<SortBy>("latest")
    const [page, setPage] = useState(1)
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const pageSize = 12

    // Reset state when params change
    useEffect(() => {
        setPage(1)
        setModalOpen(false)
    }, [categoryParam, tagParam])

    // Use props data
    const allPrompts = initialPrompts
    const categories = getAllCategories()

    // 筛选
    let filteredPrompts = allPrompts
    let currentCategoryName = "全部"

    if (tagParam) {
        const tag = getTagBySlug(tagParam)
        if (tag) {
            // Note: getPromptsByTag mock util uses static data, we need dynamic filtering here
            // filteredPrompts = getPromptsByTag(tagParam) -> Dynamic replacement below:
            filteredPrompts = allPrompts.filter(p => p.tags.includes(tag.id))
            currentCategoryName = `#${tag.name}`
        } else {
            // Fallback if tag name not found in static list (for new tags?)
            // For now try to filter anyway
            filteredPrompts = allPrompts.filter(p => p.tags.includes(tagParam))
            currentCategoryName = `#${tagParam}`
        }
    } else if (categoryParam) {
        const category = categories.find(c => c.slug === categoryParam)
        if (category) {
            filteredPrompts = allPrompts.filter(p => p.categoryId === category.id)
            currentCategoryName = category.name
        }
    }

    // 排序
    // Custom sort logic based on period stats if available
    let sortedPrompts = [...filteredPrompts]

    if (['today', 'week', 'month'].includes(sortBy) && periodStats) {
        const statsMap = periodStats[sortBy as keyof typeof periodStats]

        // Filter out prompts with 0 views in this period (optional, but usually desired for "Trending")
        // Or just sort them to bottom? Let's sort to bottom.

        sortedPrompts.sort((a, b) => {
            const viewsA = statsMap.get(a.id) || 0
            const viewsB = statsMap.get(b.id) || 0

            if (viewsA !== viewsB) {
                return viewsB - viewsA // Higher views first
            }
            // Fallback to total views or latest?
            return b.views - a.views
        })
    } else {
        // Fallback to standard sort utils
        sortedPrompts = sortPrompts(filteredPrompts, sortBy)
    }

    // 分页
    const paginatedData = paginatePrompts(sortedPrompts, page, pageSize)

    const handleLoadMore = () => {
        setPage(page + 1)
    }

    // 显示的提示词列表（累积加载）
    const displayedPrompts = sortedPrompts.slice(0, page * pageSize)

    // 处理卡片点击
    const handleCardClick = (prompt: Prompt) => {
        setSelectedPrompt(prompt)
        setModalOpen(true)
        recordView(prompt.id)
    }

    // 响应式列数
    const [columns, setColumns] = useState(2)

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1280) setColumns(4)
            else if (window.innerWidth >= 1024) setColumns(3)
            else setColumns(2)
        }

        updateColumns()
        window.addEventListener("resize", updateColumns)
        return () => window.removeEventListener("resize", updateColumns)
    }, [])

    // 将 prompts 分配到列中
    const columnPrompts = Array.from({ length: columns }, () => [] as Prompt[])
    displayedPrompts.forEach((prompt, index) => {
        columnPrompts[index % columns].push(prompt)
    })

    return (
        <div className="min-h-screen bg-background">
            <main className="w-full max-w-[2400px] mx-auto px-3 py-6">
                {/* Simplified Hero Section */}
                <section className="text-center py-8 md:py-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
                        {currentCategoryName === "全部" ? siteConfig.name : currentCategoryName}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 text-pretty">
                        探索数千个免费的 AI 图像 Prompts，即刻复制使用，创建令人惊叹的 AI 艺术作品
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span className="px-3 py-1 rounded-full bg-accent/50 dark:bg-accent/20">
                            {filteredPrompts.length} 个 Prompts
                        </span>
                        <span className="px-3 py-1 rounded-full bg-accent/50 dark:bg-accent/20">
                            {categories.length} 个分类
                        </span>
                    </div>
                </section>

                {/* Sort Controls */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                        <h2 className="text-xl font-bold">探索作品</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                variant={sortBy === "latest" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSortBy("latest")}
                            >
                                {uiText.sort.latest}
                            </Button>
                            <Button
                                variant={sortBy === "popular" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSortBy("popular")}
                            >
                                {uiText.sort.popular}
                            </Button>
                            <Button
                                variant={sortBy === "trending" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSortBy("trending")}
                            >
                                {uiText.sort.trending}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Masonry Gallery (JS Layout) */}
                {displayedPrompts.length > 0 ? (
                    <>
                        <div className="flex gap-2 items-start">
                            {columnPrompts.map((col, colIndex) => (
                                <div key={colIndex} className="flex flex-col gap-2 flex-1 min-w-0">
                                    {col.map((prompt) => (
                                        <ImageCard
                                            key={prompt.id}
                                            prompt={prompt}
                                            onCardClick={() => handleCardClick(prompt)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Infinite Scroll Sentinel */}
                        {paginatedData.hasMore && (
                            <div
                                className="h-20 flex items-center justify-center mt-8 w-full"
                                ref={(el) => {
                                    if (el) {
                                        const observer = new IntersectionObserver(
                                            (entries) => {
                                                if (entries[0].isIntersecting) {
                                                    handleLoadMore()
                                                }
                                            },
                                            { threshold: 0.1, rootMargin: '100px' }
                                        )
                                        observer.observe(el)
                                        return () => observer.disconnect()
                                    }
                                }}
                            >
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-sm">正在加载更多...</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">暂无作品</p>
                    </div>
                )}
            </main>

            {/* Image Modal */}
            <ImageModal
                prompt={selectedPrompt}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSelectPrompt={setSelectedPrompt}
            />

            {/* Footer */}
            <footer className="mt-20 py-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p className="text-sm">© {siteConfig.copyright.year} {siteConfig.name}. {siteConfig.copyright.text}。</p>
                </div>
            </footer>
        </div>
    )
}
