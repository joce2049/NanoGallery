import { ImageCard } from "@/features/gallery/components/image-card"
import { ChevronLeft, Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getPromptTags, getRelatedPrompts } from "@/core/data-utils"
import { TagList } from "@/features/tags/components/tag-badge"
import { StatsBadge } from "@/features/stats/components/stats-badge"
import { CopyPromptButton } from "@/features/prompts/components/copy-prompt-button"
import { notFound } from "next/navigation"
import { isPublishedPrompt, siteConfig } from "@/config"
import { JSONFileDB } from "@/server/db"
import { getImageUrl } from "@/shared/lib/utils"
import { getRuntimeSettings } from "@/server/settings"
import { getStats as getRemoteStats } from "@/server/supabase"

interface PromptDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
    const { id } = await params
    const [prompt, allPrompts, allTags, settings, remoteStats] = await Promise.all([
        JSONFileDB.getPromptById(id),
        JSONFileDB.getAllPrompts({ includeContent: false }),
        JSONFileDB.getAllTags(),
        getRuntimeSettings(),
        getRemoteStats(id),
    ])

    if (!prompt || !isPublishedPrompt(prompt)) {
        notFound()
    }

    const tags = getPromptTags(prompt, allTags)
    const relatedPrompts = getRelatedPrompts(prompt, allPrompts, 6)
    const isPromptContentPublic = prompt.contentPublic !== false
    // 与首页一致：本地计数与 Supabase 计数取较大值
    const mergedStats = {
        views: Math.max(prompt.views || 0, remoteStats?.views || 0),
        copies: Math.max(prompt.copies || 0, remoteStats?.copies || 0),
        likes: Math.max(prompt.likes || 0, remoteStats?.likes || 0),
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                    <ChevronLeft className="h-4 w-4" />
                    返回探索
                </Link>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    {/* Image */}
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                        <Image
                            src={getImageUrl(prompt.imageUrl) || "/placeholder.svg"}
                            alt={prompt.title}
                            width={800}
                            height={1000}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{prompt.title}</h1>
                            {prompt.description && (
                                <p className="text-lg text-muted-foreground mb-4">{prompt.description}</p>
                            )}
                            <StatsBadge views={mergedStats.views} copies={mergedStats.copies} likes={mergedStats.likes} showLabel className="mb-4" />
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">标签</h3>
                                <TagList tags={tags} size="md" />
                            </div>
                        )}

                        {/* Prompt Content */}
                        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Prompt 内容
                                </h3>
                                {isPromptContentPublic && (
                                    <CopyPromptButton promptId={prompt.id} content={prompt.content} size="sm" />
                                )}
                            </div>
                            {isPromptContentPublic ? (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{prompt.content}</p>
                            ) : (
                                <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                                    <div className="rounded-full border border-border bg-background/70 p-3 shadow-sm">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <p className="max-w-sm text-sm leading-relaxed">
                                        {settings.prompt.lockedContentMessage}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Metadata */}
                        {prompt.metadata && (
                            <div className="grid grid-cols-2 gap-4">
                                {prompt.metadata.model && (
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-xs text-muted-foreground mb-1">模型</p>
                                        <p className="text-sm font-medium">{prompt.metadata.model}</p>
                                    </div>
                                )}
                                {prompt.metadata.aspectRatio && (
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-xs text-muted-foreground mb-1">比例</p>
                                        <p className="text-sm font-medium">{prompt.metadata.aspectRatio}</p>
                                    </div>
                                )}
                                {prompt.metadata.style && (
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-xs text-muted-foreground mb-1">风格</p>
                                        <p className="text-sm font-medium">{prompt.metadata.style}</p>
                                    </div>
                                )}
                                {prompt.publishedAt && (
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-xs text-muted-foreground mb-1">发布时间</p>
                                        <p className="text-sm font-medium">
                                            {new Date(prompt.publishedAt).toLocaleDateString("zh-CN")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Prompts */}
                {relatedPrompts.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6">相关 Prompts</h2>
                        <div className="masonry-grid">
                            {relatedPrompts.map((relatedPrompt) => (
                                <ImageCard key={relatedPrompt.id} prompt={relatedPrompt} />
                            ))}
                        </div>
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
