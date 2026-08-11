"use client"

import { SearchBar } from "@/features/search/components/search-bar"
import { PopularTags } from "@/features/gallery/components/popular-tags"
import { SearchResultCard } from "@/features/search/components/search-result-card"
import { SegmentedControl } from "@/shared/ui/segmented-control"
import { sortPrompts } from "@/core/data-utils"
import type { Prompt, SortBy, Tag } from "@/core/types"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { siteConfig, sortOptions } from "@/config"
import { useRuntimeSettings } from "@/shared/lib/use-runtime-settings"

function SearchPageContent() {
    const settings = useRuntimeSettings()
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryParam = searchParams.get("q") || ""
    const sortParam = searchParams.get("sort") as SortBy | null

    const [query, setQuery] = useState(queryParam)
    const [sortBy, setSortBy] = useState<SortBy>(sortParam || "latest")
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [results, setResults] = useState<Prompt[]>([])
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        setQuery(queryParam)
    }, [queryParam])

    useEffect(() => {
        if (sortParam && ["latest", "popular", "trending", "copies", "likes"].includes(sortParam)) {
            setSortBy(sortParam)
        }
    }, [sortParam])

    useEffect(() => {
        Promise.all([
            fetch("/api/prompts?sort=latest").then(res => res.ok ? res.json() : []),
            fetch("/api/tags").then(res => res.ok ? res.json() : []),
        ])
            .then(([promptData, tagData]: [Prompt[], Tag[]]) => {
                setPrompts(promptData)
                setTags(tagData)
            })
            .catch(() => {
                setPrompts([])
                setTags([])
            })
    }, [])

    // 服务端全文搜索（可命中正文），随 URL 中的 q 变化触发
    useEffect(() => {
        const trimmed = queryParam.trim()
        if (!trimmed) {
            setResults([])
            setSearching(false)
            return
        }

        const controller = new AbortController()
        setSearching(true)
        fetch(`/api/prompts?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
            .then(res => res.ok ? res.json() : [])
            .then((data: Prompt[]) => setResults(Array.isArray(data) ? data : []))
            .catch((error) => {
                if (error instanceof DOMException && error.name === "AbortError") return
                setResults([])
            })
            .finally(() => setSearching(false))

        return () => controller.abort()
    }, [queryParam])

    const sortedResults = sortPrompts(results, sortBy)

    const handleSearch = (newQuery: string) => {
        setQuery(newQuery)
        const params = new URLSearchParams(searchParams.toString())
        if (newQuery.trim()) {
            params.set("q", newQuery.trim())
        } else {
            params.delete("q")
        }
        const nextUrl = params.toString() ? `/search?${params.toString()}` : "/search"
        router.push(nextUrl, { scroll: false })
    }

    const updateSort = (nextSort: SortBy) => {
        setSortBy(nextSort)
        const params = new URLSearchParams(searchParams.toString())
        if (nextSort === "latest") {
            params.delete("sort")
        } else {
            params.set("sort", nextSort)
        }
        const nextUrl = params.toString() ? `/search?${params.toString()}` : "/search"
        router.replace(nextUrl, { scroll: false })
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* Search Section */}
                <section className="max-w-3xl mx-auto py-8 md:py-12">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-balance bg-gradient-to-r from-slate-900 via-slate-500 to-cyan-500 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-cyan-100">
                        搜索 Prompts
                    </h1>
                    <SearchBar defaultValue={query} onSearch={handleSearch} className="w-full" />
                    <PopularTags prompts={prompts} tags={tags} className="mt-5" />
                </section>

                {/* Results */}
                {query.trim() ? (
                    <section>
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <h2 className="text-2xl font-bold">
                                搜索结果 {sortedResults.length > 0 && `(${sortedResults.length})`}
                            </h2>
                            <SegmentedControl
                                value={sortBy}
                                onValueChange={updateSort}
                                options={sortOptions}
                                label="排序方式"
                            />
                        </div>

                        {sortedResults.length > 0 ? (
                            <div className="masonry-grid">
                                {sortedResults.map((prompt) => (
                                    <SearchResultCard key={prompt.id} prompt={prompt} query={query} />
                                ))}
                            </div>
                        ) : searching ? (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground">正在搜索...</p>
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
                    <p className="text-sm">© {siteConfig.copyright.year} {settings.site.name}. {settings.site.copyrightText}。</p>
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
