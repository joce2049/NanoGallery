import { NextResponse } from 'next/server'
import { incrementStat, getStats, isSupabaseConfigured, recordEvent } from '@/server/supabase'
import { JSONFileDB } from '@/server/db'

// Server-side rate limiting: track last view time per promptId
// Prevents duplicate recordings from React StrictMode double-calls
const lastViewTime = new Map<string, number>()
const VIEW_COOLDOWN_MS = 2000 // 2 seconds cooldown between views for same prompt

export async function POST(request: Request) {
    try {
        const { promptId, eventType } = await request.json()

        if (!promptId || !eventType) {
            return NextResponse.json(
                { error: 'Missing promptId or eventType' },
                { status: 400 }
            )
        }

        if (!['view', 'copy', 'like'].includes(eventType)) {
            return NextResponse.json(
                { error: 'Invalid eventType. Must be: view, copy, or like' },
                { status: 400 }
            )
        }

        const statType = eventType === 'view' ? 'views'
            : eventType === 'copy' ? 'copies'
                : 'likes'

        if (!isSupabaseConfigured) {
            const prompt = await JSONFileDB.incrementPromptStat(promptId, statType)
            if (!prompt) {
                return NextResponse.json(
                    { error: 'Prompt not found' },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                stats: {
                    views: prompt.views || 0,
                    copies: prompt.copies || 0,
                    likes: prompt.likes || 0,
                },
                configured: false
            })
        }

        // Parallel execution: increment counter AND record detailed event
        // We don't await recordEvent to avoid slowing down response, 
        // or we use Promise.all if we want assurance.
        // For analytics, fire-and-forget or parallel is fine.
        const [success] = await Promise.all([
            incrementStat(promptId, statType),
            recordEvent(promptId, eventType, 'anon') // 'anon' as placeholder visitorId
        ])

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to record stat' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Stats API] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const promptId = searchParams.get('promptId')
        const shouldRecordView = searchParams.get('recordView') === 'true'

        if (!promptId) {
            return NextResponse.json(
                { error: 'Missing promptId parameter' },
                { status: 400 }
            )
        }

        if (!isSupabaseConfigured) {
            if (shouldRecordView) {
                const now = Date.now()
                const lastTime = lastViewTime.get(promptId) || 0

                if (now - lastTime > VIEW_COOLDOWN_MS) {
                    lastViewTime.set(promptId, now)
                    await JSONFileDB.incrementPromptStat(promptId, 'views')
                }
            }

            const stats = await JSONFileDB.getStats(promptId)

            return NextResponse.json({
                views: stats?.views ?? 0,
                copies: stats?.copies ?? 0,
                likes: stats?.likes ?? 0,
                configured: false
            })
        }

        // Record view if requested, with server-side rate limiting
        if (shouldRecordView) {
            const now = Date.now()
            const lastTime = lastViewTime.get(promptId) || 0

            // Only record if cooldown has passed
            if (now - lastTime > VIEW_COOLDOWN_MS) {
                lastViewTime.set(promptId, now)

                // Parallel record
                await Promise.all([
                    incrementStat(promptId, 'views'),
                    recordEvent(promptId, 'view', 'anon')
                ])
                console.log(`[Stats API] View recorded for ${promptId}`)
            } else {
                console.log(`[Stats API] View skipped (cooldown) for ${promptId}`)
            }
        }

        const [remoteStats, localStats] = await Promise.all([
            getStats(promptId),
            JSONFileDB.getStats(promptId)
        ])

        return NextResponse.json({
            views: Math.max(remoteStats?.views ?? 0, localStats?.views ?? 0),
            copies: Math.max(remoteStats?.copies ?? 0, localStats?.copies ?? 0),
            likes: Math.max(remoteStats?.likes ?? 0, localStats?.likes ?? 0),
            configured: true
        })
    } catch (error) {
        console.error('[Stats API] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
