import { NextResponse } from 'next/server'
import { incrementStat, getStats, isSupabaseConfigured, recordEvent } from '@/server/supabase'
import { JSONFileDB } from '@/server/db'

// Server-side rate limiting: track last view time per promptId
// Prevents duplicate recordings from React StrictMode double-calls
const lastViewTime = new Map<string, number>()
const VIEW_COOLDOWN_MS = 2000 // 2 seconds cooldown between views for same prompt

// POST 无鉴权，加按 (事件+prompt+IP) 的冷却，抑制刷量与磁盘写放大 DoS
const eventCooldown = new Map<string, number>()
const EVENT_COOLDOWN_MS = 1500
const MAX_COOLDOWN_KEYS = 20000

function getClientIp(request: Request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')?.trim()
        || 'local'
}

// 冷却 Map 的 key 含可伪造的 IP，容量兜底避免被刷爆内存
function pruneCooldownMap(map: Map<string, number>, now: number) {
    if (map.size <= MAX_COOLDOWN_KEYS) return
    for (const [key, time] of map.entries()) {
        if (now - time > EVENT_COOLDOWN_MS) map.delete(key)
    }
    if (map.size > MAX_COOLDOWN_KEYS) {
        const overflow = Array.from(map.entries())
            .sort((a, b) => a[1] - b[1])
            .slice(0, map.size - MAX_COOLDOWN_KEYS)
        for (const [key] of overflow) map.delete(key)
    }
}

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

        // 冷却：同一 (事件, prompt, IP) 在窗口内只记一次
        const now = Date.now()
        const cooldownKey = `${eventType}:${promptId}:${getClientIp(request)}`
        const lastEvent = eventCooldown.get(cooldownKey) || 0
        if (now - lastEvent < EVENT_COOLDOWN_MS) {
            return NextResponse.json({ success: true, throttled: true })
        }
        eventCooldown.set(cooldownKey, now)
        pruneCooldownMap(eventCooldown, now)

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
                    pruneCooldownMap(lastViewTime, now)
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
                pruneCooldownMap(lastViewTime, now)

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
