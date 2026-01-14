"use client"
import { Search, X, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllTags } from "@/lib/data-utils"

interface SearchBarProps {
    defaultValue?: string
    onSearch?: (query: string) => void
    className?: string
}

export function SearchBar({ defaultValue = "", onSearch, className = "" }: SearchBarProps) {
    const [query, setQuery] = useState(defaultValue)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)

    const allTags = getAllTags()
    const suggestions = query.trim()
        ? allTags.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        : []

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
                    className="pl-10 pr-10"
                    autoComplete="off"
                />
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground rounded-md border shadow-md animate-in fade-in-0 zoom-in-95">
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
