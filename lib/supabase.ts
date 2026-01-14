import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查 Supabase 是否已配置
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// 创建 Supabase 客户端（如果配置了）
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null

// 数据库表类型定义
export interface PromptStats {
    id: string
    prompt_id: string
    views: number
    copies: number
    likes: number
    created_at: string
    updated_at: string
}

export interface StatEvent {
    id: string
    prompt_id: string
    event_type: 'view' | 'copy' | 'like'
    visitor_id: string
    created_at: string
}

/**
 * 获取或创建 Prompt 统计记录
 */
export async function getOrCreateStats(promptId: string): Promise<PromptStats | null> {
    if (!supabase) return null

    // 先尝试获取现有记录
    const { data: existing } = await supabase
        .from('prompt_stats')
        .select('*')
        .eq('prompt_id', promptId)
        .single()

    if (existing) return existing

    // 如果不存在，创建新记录
    const { data: created, error } = await supabase
        .from('prompt_stats')
        .insert({
            prompt_id: promptId,
            views: 0,
            copies: 0,
            likes: 0
        })
        .select()
        .single()

    if (error) {
        console.error('[Supabase] Error creating stats:', error)
        return null
    }

    return created
}

/**
 * 增加统计计数
 */
export async function incrementStat(
    promptId: string,
    statType: 'views' | 'copies' | 'likes'
): Promise<boolean> {
    if (!supabase) {
        console.log(`[Stats] Supabase not configured, skipping ${statType} increment for ${promptId}`)
        return false
    }

    try {
        // 使用 RPC 调用来原子性地增加计数
        const { error } = await supabase.rpc('increment_stat', {
            p_prompt_id: promptId,
            p_stat_type: statType
        })

        if (error) {
            // 如果 RPC 不存在，回退到普通更新
            console.log('[Supabase] RPC not found, using fallback method')
            return await incrementStatFallback(promptId, statType)
        }

        console.log(`[Supabase] ${statType} incremented for ${promptId}`)
        return true
    } catch (err) {
        console.error('[Supabase] Error incrementing stat:', err)
        return false
    }
}

/**
 * 回退方法：使用 upsert 增加计数
 */
async function incrementStatFallback(
    promptId: string,
    statType: 'views' | 'copies' | 'likes'
): Promise<boolean> {
    if (!supabase) return false

    // 先获取当前值
    const { data: current } = await supabase
        .from('prompt_stats')
        .select('*')
        .eq('prompt_id', promptId)
        .single()

    const currentValue = current?.[statType] ?? 0

    // 使用 upsert 更新
    const updateData: Record<string, unknown> = {
        prompt_id: promptId,
        [statType]: currentValue + 1,
        updated_at: new Date().toISOString()
    }

    // 如果是新记录，初始化其他字段
    if (!current) {
        updateData.views = statType === 'views' ? 1 : 0
        updateData.copies = statType === 'copies' ? 1 : 0
        updateData.likes = statType === 'likes' ? 1 : 0
    }

    const { error } = await supabase
        .from('prompt_stats')
        .upsert(updateData, { onConflict: 'prompt_id' })

    if (error) {
        console.error('[Supabase] Fallback increment failed:', error)
        return false
    }

    return true
}

/**
 * 获取 Prompt 统计数据
 */
export async function getStats(promptId: string): Promise<{ views: number; copies: number; likes: number } | null> {
    if (!supabase) return null

    const { data, error } = await supabase
        .from('prompt_stats')
        .select('views, copies, likes')
        .eq('prompt_id', promptId)
        .single()

    if (error || !data) return null

    return data
}

/**
 * 批量获取多个 Prompt 的统计数据
 */
export async function getBatchStats(promptIds: string[]): Promise<Map<string, PromptStats>> {
    const result = new Map<string, PromptStats>()

    if (!supabase || promptIds.length === 0) return result

    const { data, error } = await supabase
        .from('prompt_stats')
        .select('*')
        .in('prompt_id', promptIds)

    if (error || !data) return result

    data.forEach((stat: PromptStats) => {
        result.set(stat.prompt_id, stat)
    })

    return result
}

/**
 * 记录详细事件（可选功能）
 */
export async function recordEvent(
    promptId: string,
    eventType: 'view' | 'copy' | 'like',
    visitorId: string
): Promise<boolean> {
    if (!supabase) return false

    const { error } = await supabase
        .from('stat_events')
        .insert({
            prompt_id: promptId,
            event_type: eventType,
            visitor_id: visitorId
        })

    if (error) {
        console.error('[Supabase] Error recording event:', error)
        return false
    }

    return true
}

/**
 * 获取所有 Prompt 的统计数据
 */
export async function getAllStats(): Promise<Map<string, PromptStats>> {
    const result = new Map<string, PromptStats>()

    if (!supabase) return result

    const { data, error } = await supabase
        .from('prompt_stats')
        .select('*')

    if (error || !data) return result

    data.forEach((stat: PromptStats) => {
        result.set(stat.prompt_id, stat)
    })

    return result
}

/**
 * 获取特定时间段内的统计数据
 */
export async function getPeriodStats(period: 'today' | 'week' | 'month'): Promise<Map<string, number>> {
    const result = new Map<string, number>()

    if (!supabase) return result

    // Calculate start time
    const now = new Date()
    let days = 0
    if (period === 'today') days = 1
    if (period === 'week') days = 7
    if (period === 'month') days = 30

    const startTime = new Date(now.setDate(now.getDate() - days)).toISOString()

    // Query stat_events for views since startTime
    // Since we can't easily do GROUP BY in simple client query without RPC,
    // we'll fetch views and aggregate in memory (assuming reasonable volume for now)
    // For high volume, this should eventually be an RPC
    const { data, error } = await supabase
        .from('stat_events')
        .select('prompt_id')
        .eq('event_type', 'view')
        .gte('created_at', startTime)

    if (error || !data) return result

    // Aggregate
    data.forEach((event: { prompt_id: string }) => {
        const current = result.get(event.prompt_id) || 0
        result.set(event.prompt_id, current + 1)
    })

    return result
}
