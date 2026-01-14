/**
 * 核心数据类型定义
 */

export interface Prompt {
  id: string
  title: string
  content: string // Prompt 正文
  description?: string // 简短描述
  imageUrl: string // 示例图片
  categoryId?: string
  tags: string[] // Tag IDs
  metadata?: PromptMetadata
  status: "published" | "draft" | "archived"
  views: number
  copies: number
  likes: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface PromptMetadata {
  model?: string // 使用的模型
  aspectRatio?: string // 图片比例
  style?: string // 风格
  negativePrompt?: string // 反向提示词
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  order: number
  enabled: boolean
}

export interface Tag {
  id: string
  name: string
  slug: string
  color?: string
}

export interface ViewEvent {
  promptId: string
  timestamp: Date
  visitorId: string // 匿名访客 ID
}

export interface CopyEvent {
  promptId: string
  timestamp: Date
  visitorId: string
}

export interface DailyStat {
  date: string // YYYY-MM-DD
  promptId: string
  views: number
  copies: number
}

export type TimePeriod = "today" | "week" | "month"

export type SortBy = "latest" | "popular" | "trending" | "today" | "week" | "month"
