import { NextResponse } from 'next/server'
import { getBatchStats, isSupabaseConfigured } from '@/lib/supabase'

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

        const promptIds = promptIdsParam.split(',')

        if (!isSupabaseConfigured) {
            // Return empty stats if Supabase not configured
            const emptyStats: Record<string, { views: number; copies: number; likes: number }> = {}
            promptIds.forEach(id => {
                emptyStats[id] = { views: 0, copies: 0, likes: 0 }
            })
            return NextResponse.json({ stats: emptyStats, configured: false })
        }

        const statsMap = await getBatchStats(promptIds)

        const result: Record<string, { views: number; copies: number; likes: number }> = {}
        promptIds.forEach(id => {
            const stat = statsMap.get(id)
            result[id] = {
                views: stat?.views ?? 0,
                copies: stat?.copies ?? 0,
                likes: stat?.likes ?? 0
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
