/**
 * 网站配置文件
 * 在这里集中管理所有网站配置，包括站点信息、分类、标签、UI 文本等
 */

import type { Category, Tag } from "./types"

/**
 * 站点基本信息配置
 */
export const siteConfig = {
    /** 站点名称 */
    name: "Nano Gallery",

    /** 站点描述 */
    description: "探索数千个免费的 AI 图像 Prompts，即刻复制使用，创建令人惊叹的 AI 艺术作品",

    /** SEO 元数据 */
    metadata: {
        title: "Nano Gallery - AI Prompts 探索与发现",
        description: "探索精美的 AI 生成图片和 Prompts，创建令人惊叹的艺术作品",
        keywords: ["AI", "Prompts", "图像生成", "Midjourney", "DALL-E", "Stable Diffusion"],
    },

    /** 版权信息 */
    copyright: {
        year: "2026",
        text: "探索无限创意可能",
    },

    /** 管理后台配置 */
    admin: {
        name: "Nano Admin",
        title: "管理您的 Prompt 画廊内容",
    },
} as const

/**
 * 分类配置
 * 可以在这里添加、删除或修改分类
 */
export const categories: Category[] = [
    {
        id: "photography",
        name: "摄影",
        slug: "photography",
        description: "真实摄影风格的 AI 图像",
        order: 1,
        enabled: true
    },
    {
        id: "illustration",
        name: "插画",
        slug: "illustration",
        description: "手绘和插画风格",
        order: 2,
        enabled: true
    },
    {
        id: "3d",
        name: "3D",
        slug: "3d",
        description: "三维渲染和建模",
        order: 3,
        enabled: true
    },
    {
        id: "ai-art",
        name: "AI 艺术",
        slug: "ai-art",
        description: "创意 AI 艺术作品",
        order: 4,
        enabled: true
    },
    {
        id: "poster",
        name: "海报",
        slug: "poster",
        description: "海报和宣传设计",
        order: 5,
        enabled: true
    },
    {
        id: "branding",
        name: "品牌",
        slug: "branding",
        description: "品牌和 logo 设计",
        order: 6,
        enabled: true
    },
    {
        id: "product",
        name: "产品",
        slug: "product",
        description: "产品摄影和展示",
        order: 7,
        enabled: true
    },
    {
        id: "concept",
        name: "概念",
        slug: "concept",
        description: "概念艺术和设计",
        order: 8,
        enabled: true
    },
    {
        id: "character",
        name: "角色",
        slug: "character",
        description: "人物和角色设计",
        order: 9,
        enabled: true
    },
    {
        id: "landscape",
        name: "风景",
        slug: "landscape",
        description: "自然和城市风景",
        order: 10,
        enabled: true
    },
]

/**
 * 标签配置
 * 可以在这里添加、删除或修改标签
 */
export const tags: Tag[] = [
    { id: "portrait", name: "肖像", slug: "portrait", color: "#FF6B6B" },
    { id: "minimalist", name: "极简", slug: "minimalist", color: "#4ECDC4" },
    { id: "cinematic", name: "电影感", slug: "cinematic", color: "#FFB84D" },
    { id: "vibrant", name: "鲜艳", slug: "vibrant", color: "#A8E6CF" },
    { id: "dark", name: "暗黑", slug: "dark", color: "#95A5A6" },
    { id: "fantasy", name: "奇幻", slug: "fantasy", color: "#C39BD3" },
    { id: "realistic", name: "写实", slug: "realistic", color: "#85C1E2" },
    { id: "abstract", name: "抽象", slug: "abstract", color: "#F8B195" },
    { id: "retro", name: "复古", slug: "retro", color: "#F67280" },
    { id: "futuristic", name: "未来", slug: "futuristic", color: "#6C5CE7" },
    { id: "studio", name: "工作室", slug: "studio", color: "#A29BFE" },
    { id: "outdoor", name: "户外", slug: "outdoor", color: "#74B9FF" },
    { id: "closeup", name: "特写", slug: "closeup", color: "#FD79A8" },
    { id: "wideangle", name: "广角", slug: "wideangle", color: "#FDCB6E" },
    { id: "macro", name: "微距", slug: "macro", color: "#00B894" },
    { id: "fashion", name: "时尚", slug: "fashion", color: "#E17055" },
    { id: "editorial", name: "编辑", slug: "editorial", color: "#B2BEC3" },
    { id: "artistic", name: "艺术", slug: "artistic", color: "#DFE6E9" },
]

/**
 * UI 文本配置
 */
export const uiText = {
    /** 导航标签 */
    navigation: {
        all: "全部",
        today: "今日",
        week: "本周",
        month: "本月",
        search: "搜索",
        categories: "分类",
    },

    /** 按钮文本 */
    buttons: {
        loadMore: "加载更多作品",
        copy: "复制",
        like: "点赞",
        share: "分享",
        login: "登录",
        logout: "退出登录",
        back: "返回",
        cancel: "取消",
        confirm: "确定",
    },

    /** 页面标题 */
    pages: {
        home: "Nano Gallery",
        search: "搜索",
        top: {
            today: "今日 Prompts",
            week: "本周 Prompts",
            month: "本月 Prompts",
        },
    },

    /** 空状态文本 */
    empty: {
        noPrompts: "暂无 Prompts",
        noResults: "未找到相关结果",
        noContent: "暂无内容，点击右上角新建",
    },

    /** 提示信息 */
    messages: {
        copied: "已复制到剪贴板",
        loginRequired: "请先登录",
        confirmLogout: "确定要退出登录吗？",
        logoutDescription: "您将退出当前账户。",
    },
    /** 排序选项文本 */
    sort: {
        latest: "最新",
        popular: "热门",
        trending: "趋势",
    },
} as const
