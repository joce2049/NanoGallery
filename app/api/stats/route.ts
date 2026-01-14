import { NextResponse } from 'next/server'
import { incrementStat, getStats, isSupabaseConfigured, recordEvent } from '@/lib/supabase'

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

        // 如果 Supabase 未配置，返回成功但不记录
        if (!isSupabaseConfigured) {
            console.log(`[Stats API] Supabase not configured, skipping ${eventType} for ${promptId}`)
            return NextResponse.json({
                success: true,
                message: 'Stats tracking disabled (Supabase not configured)'
            })
        }

        const statType = eventType === 'view' ? 'views'
            : eventType === 'copy' ? 'copies'
                : 'likes'

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
            return NextResponse.json({
                views: 0,
                copies: 0,
                likes: 0,
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
                // Parallel record
                await Promise.all([
                    incrementStat(promptId, 'views'),
                    recordEvent(promptId, 'view', 'anon')
                ])
                console.log(`[Stats API] View recorded for ${promptId}`)

                // DEBUG: Check file system visibility
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const uploadDir = path.join(process.cwd(), 'public/uploads');
                    console.log(`[Debug FS] CWD: ${process.cwd()}`);
                    console.log(`[Debug FS] Checking dir: ${uploadDir}`);
                    if (fs.existsSync(uploadDir)) {
                        const files = fs.readdirSync(uploadDir);
                        console.log(`[Debug FS] Files in uploads (${files.length}):`, files.slice(0, 5));
                    } else {
                        console.log('[Debug FS] public/uploads directory NOT FOUND');
                        // Try listing current dir
                        console.log('[Debug FS] Root files:', fs.readdirSync(process.cwd()));
                    }
                } catch (e) {
                    console.error('[Debug FS] Error checking FS:', e);
                }
            } else {
                console.log(`[Stats API] View skipped (cooldown) for ${promptId}`)
            }
        }

        const stats = await getStats(promptId)

        return NextResponse.json({
            views: stats?.views ?? 0,
            copies: stats?.copies ?? 0,
            likes: stats?.likes ?? 0,
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

