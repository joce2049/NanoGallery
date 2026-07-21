import { Suspense } from "react"
import { ClientGallery } from "@/features/gallery/components/client-gallery"
import { JSONFileDB } from "@/server/db"
import { getAllStats } from "@/server/supabase"
import { getPublishedPrompts } from "@/core/data-utils"
import { getRuntimeSettings, toPublicRuntimeSettings } from "@/server/settings"

export const dynamic = 'force-dynamic' // Ensure we fetch fresh data on every request

export default async function HomePage() {
  // Fetch prompts and all stats in parallel
  const [prompts, categories, tags, statsMap, settings] = await Promise.all([
    JSONFileDB.getAllPrompts({ includeContent: false }),
    JSONFileDB.getAllCategories(),
    JSONFileDB.getAllTags(),
    getAllStats(),
    getRuntimeSettings()
  ])

  // Merge real-time stats into prompts (total stats)
  const publishedPrompts = getPublishedPrompts(prompts)

  const enrichedPrompts = publishedPrompts.map(p => {
    const stats = statsMap.get(p.id)
    if (stats) {
      return {
        ...p,
        views: Math.max(p.views || 0, stats.views || 0),
        copies: Math.max(p.copies || 0, stats.copies || 0),
        likes: Math.max(p.likes || 0, stats.likes || 0)
      }
    }
    return p
  })

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading Gallery...</div>}>
      <ClientGallery
        initialPrompts={enrichedPrompts}
        categories={categories}
        tags={tags}
        settings={toPublicRuntimeSettings(settings)}
      />
    </Suspense>
  )
}
