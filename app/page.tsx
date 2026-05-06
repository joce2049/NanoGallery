import { Suspense } from "react"
import { ClientGallery } from "@/components/client-gallery"
import { JSONFileDB } from "@/lib/db"
import { getAllStats, getPeriodStats } from "@/lib/supabase"

export const dynamic = 'force-dynamic' // Ensure we fetch fresh data on every request

export default async function HomePage() {
  // Fetch prompts and all stats in parallel
  const [prompts, categories, tags, statsMap, todayStats, weekStats, monthStats] = await Promise.all([
    JSONFileDB.getAllPrompts(),
    JSONFileDB.getAllCategories(),
    JSONFileDB.getAllTags(),
    getAllStats(),
    getPeriodStats('today'),
    getPeriodStats('week'),
    getPeriodStats('month')
  ])

  // Merge real-time stats into prompts (total stats)
  const enrichedPrompts = prompts.map(p => {
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
        periodStats={{
          today: todayStats,
          week: weekStats,
          month: monthStats
        }}
      />
    </Suspense>
  )
}
