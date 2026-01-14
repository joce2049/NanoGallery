import { Suspense } from "react"
import { ClientGallery } from "@/components/client-gallery"
import { JSONFileDB } from "@/lib/db"
import { getAllStats, getPeriodStats } from "@/lib/supabase"

export const dynamic = 'force-dynamic' // Ensure we fetch fresh data on every request

export default async function HomePage() {
  // Fetch prompts and all stats in parallel
  const [prompts, statsMap, todayStats, weekStats, monthStats] = await Promise.all([
    JSONFileDB.getAllPrompts(),
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
        views: stats.views,
        copies: stats.copies,
        likes: stats.likes
      }
    }
    return p
  })

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading Gallery...</div>}>
      <ClientGallery
        initialPrompts={enrichedPrompts}
        periodStats={{
          today: todayStats,
          week: weekStats,
          month: monthStats
        }}
      />
    </Suspense>
  )
}

