"use client"
import { Search, X, Tag } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Tag as PromptTag } from "@/core/types"

interface SearchBarProps {
    defaultValue?: string
    onSearch?: (query: string) => void
    className?: string
}

export function SearchBar({ defaultValue = "", onSearch, className = "" }: SearchBarProps) {
    const [query, setQuery] = useState(defaultValue)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [allTags, setAllTags] = useState<PromptTag[]>([])
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)

    const suggestions = query.trim()
        ? allTags.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        : []

    useEffect(() => {
        fetch("/api/tags")
            .then(res => res.ok ? res.json() : [])
            .then((data: PromptTag[]) => setAllTags(data))
            .catch(() => setAllTags([]))
    }, [])

    useEffect(() => {
        setQuery(defaultValue)
    }, [defaultValue])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSearch = (e: React.FormEvent, searchQuery: string = query) => {
        e.preventDefault()
        setShowSuggestions(false)

        if (onSearch) {
            onSearch(searchQuery)
        } else {
            if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            }
        }
    }

    const handleSuggestionClick = (tagName: string) => {
        setQuery(tagName)
        handleSearch({ preventDefault: () => { } } as React.FormEvent, tagName)
    }

    const handleClear = () => {
        setQuery("")
        if (onSearch) {
            onSearch("")
        }
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <form onSubmit={(e) => handleSearch(e)} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="搜索 Prompts..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    // 扁平化：去掉基类的 shadow-xs。
                    // 聚焦态改走品牌青而非默认 ring：3px 灰环 → 1px 青环 + 青色描边，
                    // 并把 border-color 纳入过渡，否则颜色是硬切。
                    // 另屏蔽 WebKit 给 type=search 自带的原生清空按钮：本组件已有自定义的 X
                    // 按钮，不屏蔽会在有值时并排出现两个叉。Tailwind Preflight 只重置了
                    // ::-webkit-search-decoration，没管 ::-webkit-search-cancel-button。
                    className={[
                        "pl-10 pr-10 shadow-none",
                        "transition-[color,box-shadow,border-color] duration-[var(--duration-quick)] ease-[var(--ease-smooth-out)]",
                        "focus-visible:border-cyan-500/50 focus-visible:ring-1 focus-visible:ring-cyan-500/15",
                        "dark:focus-visible:border-cyan-100/40 dark:focus-visible:ring-cyan-100/10",
                        "[&::-webkit-search-cancel-button]:[-webkit-appearance:none]",
                    ].join(" ")}
                    autoComplete="off"
                />
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={handleClear}
                        aria-label="清空搜索"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground rounded-md border shadow-md animate-in fade-in-0 zoom-in-[0.97] duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)]">
                    <div className="p-1">
                        <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            建议标签
                        </p>
                        {suggestions.map((tag) => (
                            <button
                                key={tag.id}
                                className="w-full flex items-center px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                                onClick={() => handleSuggestionClick(tag.name)}
                            >
                                <Tag className="mr-2 h-3.5 w-3.5 opacity-70" />
                                <span>{tag.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
