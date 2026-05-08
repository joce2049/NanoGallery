/**
 * 首次初始化种子数据。
 *
 * 生产内容保存在 storage/data 中。这里不再内置演示 Prompt，
 * 避免 public 目录携带大量示例图片，也避免全新部署出现不属于站点的数据。
 */

import type { Prompt, DailyStat } from "./types"
import { categories, tags } from "@/config"

// 直接从配置文件导出分类和标签
export { categories, tags }

export const prompts: Prompt[] = []

// 生成模拟的统计数据（过去 30 天）
export const generateMockStats = (): DailyStat[] => {
    return []
}

export const dailyStats = generateMockStats()
