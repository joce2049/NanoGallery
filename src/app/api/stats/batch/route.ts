import { NextResponse } from 'next/server'
import { getBatchStats, isSupabaseConfigured } from '@/server/supabase'
import { JSONFileDB } from '@/server/db'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const promptIdsParam = searchParams.get('promptIds')

        if (!promptIdsParam) {
            return NextResponse.json(
                { error: 'Missing promptIds parameter' },
                { status: 400 }
            )
        }

        const promptIds = promptIdsParam
            .split(',')
            .map(id => id.trim())
            .filter(Boolean)
            .slice(0, 200) // 限制单次批量数量，避免超大查询

        if (!isSupabaseConfigured) {
            const statsMap = await JSONFileDB.getBatchStats(promptIds)
            const result: Record<string, { views: number; copies: number; likes: number }> = {}
            promptIds.forEach(id => {
                const stat = statsMap.get(id)
                result[id] = {
                    views: stat?.views ?? 0,
                    copies: stat?.copies ?? 0,
                    likes: stat?.likes ?? 0
                }
            })
            return NextResponse.json({ stats: result, configured: false })
        }

        const [remoteStatsMap, localStatsMap] = await Promise.all([
            getBatchStats(promptIds),
            JSONFileDB.getBatchStats(promptIds)
        ])

        const result: Record<string, { views: number; copies: number; likes: number }> = {}
        promptIds.forEach(id => {
            const remoteStat = remoteStatsMap.get(id)
            const localStat = localStatsMap.get(id)
            result[id] = {
                views: Math.max(remoteStat?.views ?? 0, localStat?.views ?? 0),
                copies: Math.max(remoteStat?.copies ?? 0, localStat?.copies ?? 0),
                likes: Math.max(remoteStat?.likes ?? 0, localStat?.likes ?? 0)
            }
        })

        return NextResponse.json({ stats: result, configured: true })
    } catch (error) {
        console.error('[Stats Batch API] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
