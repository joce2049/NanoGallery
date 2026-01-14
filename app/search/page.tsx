"use client"

import { ImageCard } from "@/components/image-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { searchPrompts, getAllCategories, sortPrompts } from "@/lib/data-utils"
import type { SortBy } from "@/lib/types"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { siteConfig } from "@/lib/config"

function SearchPageContent() {
    const searchParams = useSearchParams()
    const queryParam = searchParams.get("q") || ""

    const [query, setQuery] = useState(queryParam)
    const [sortBy, setSortBy] = useState<SortBy>("latest")

    useEffect(() => {
        setQuery(queryParam)
    }, [queryParam])

    const searchResults = query.trim() ? searchPrompts(query) : []
    const sortedResults = sortPrompts(searchResults, sortBy)

    const handleSearch = (newQuery: string) => {
        setQuery(newQuery)
        // Update URL
        if (newQuery.trim()) {
            window.history.pushState({}, "", `/search?q=${encodeURIComponent(newQuery)}`)
        } else {
            window.history.pushState({}, "", "/search")
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* Search Section */}
                <section className="max-w-3xl mx-auto py-8 md:py-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-balance bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400">
                        搜索 Prompts
                    </h1>
                    <SearchBar defaultValue={query} onSearch={handleSearch} className="w-full" />
                </section>

                {/* Results */}
                {query.trim() ? (
                    <section>
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <h2 className="text-2xl font-bold">
                                搜索结果 {sortedResults.length > 0 && `(${sortedResults.length})`}
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={sortBy === "latest" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSortBy("latest")}
                                >
                                    最新
                                </Button>
                                <Button
                                    variant={sortBy === "popular" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSortBy("popular")}
                                >
                                    热门
                                </Button>
                                <Button
                                    variant={sortBy === "trending" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSortBy("trending")}
                                >
                                    趋势
                                </Button>
                            </div>
                        </div>

                        {sortedResults.length > 0 ? (
                            <div className="masonry-grid">
                                {sortedResults.map((prompt) => (
                                    <ImageCard key={prompt.id} prompt={prompt} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground mb-4">未找到相关 Prompts</p>
                                <p className="text-sm text-muted-foreground">尝试使用其他关键词搜索</p>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="text-center py-12">
                        <p className="text-muted-foreground">输入关键词开始搜索</p>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 mt-20 py-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p className="text-sm">© {siteConfig.copyright.year} {siteConfig.name}. {siteConfig.copyright.text}。</p>
                </div>
            </footer>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchPageContent />
        </Suspense>
    )
}
