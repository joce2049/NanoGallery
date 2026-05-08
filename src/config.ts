/**
 * 网站配置文件
 * 在这里集中管理所有网站配置，包括站点信息、分类、标签、UI 文本等
 */

import type { Category, Prompt, Tag } from "@/core/types"

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
    { "id": "portrait", "name": "肖像", "slug": "portrait", "color": "#FF6B6B" },
    { "id": "minimalist", "name": "极简", "slug": "minimalist", "color": "#4ECDC4" },
    { "id": "cinematic", "name": "电影感", "slug": "cinematic", "color": "#FFB84D" },
    { "id": "vibrant", "name": "鲜艳", "slug": "vibrant", "color": "#A8E6CF" },
    { "id": "dark", "name": "暗黑", "slug": "dark", "color": "#95A5A6" },
    { "id": "fantasy", "name": "奇幻", "slug": "fantasy", "color": "#C39BD3" },
    { "id": "realistic", "name": "写实", "slug": "realistic", "color": "#85C1E2" },
    { "id": "abstract", "name": "抽象", "slug": "abstract", "color": "#F8B195" },
    { "id": "retro", "name": "复古", "slug": "retro", "color": "#F67280" },
    { "id": "futuristic", "name": "未来", "slug": "futuristic", "color": "#6C5CE7" },
    { "id": "studio", "name": "工作室", "slug": "studio", "color": "#A29BFE" },
    { "id": "outdoor", "name": "户外", "slug": "outdoor", "color": "#74B9FF" },
    { "id": "closeup", "name": "特写", "slug": "closeup", "color": "#FD79A8" },
    { "id": "wideangle", "name": "广角", "slug": "wideangle", "color": "#FDCB6E" },
    { "id": "macro", "name": "微距", "slug": "macro", "color": "#00B894" },
    { "id": "fashion", "name": "时尚", "slug": "fashion", "color": "#E17055" },
    { "id": "editorial", "name": "编辑", "slug": "editorial", "color": "#B2BEC3" },
    { "id": "artistic", "name": "艺术", "slug": "artistic", "color": "#DFE6E9" },
    { "id": "cyberpunk", "name": "赛博朋克", "slug": "cyberpunk", "color": "#FF006E" },
    { "id": "anime", "name": "动漫", "slug": "anime", "color": "#FB5607" },
    { "id": "watercolor", "name": "水彩", "slug": "watercolor", "color": "#8ECAE6" },
    { "id": "sketch", "name": "素描", "slug": "sketch", "color": "#023047" },
    { "id": "neon", "name": "霓虹", "slug": "neon", "color": "#FF006E" },
    { "id": "monochrome", "name": "单色", "slug": "monochrome", "color": "#495057" },
    { "id": "pastel", "name": "粉彩", "slug": "pastel", "color": "#FFD6FF" },
    { "id": "street", "name": "街拍", "slug": "street", "color": "#FF6347" },
    { "id": "japanese", "name": "日系", "slug": "japanese", "color": "#FFB6C1" },
    { "id": "korean", "name": "韩系", "slug": "korean", "color": "#FFA07A" },
    { "id": "western", "name": "欧美", "slug": "western", "color": "#CD853F" },
    { "id": "tech", "name": "科技", "slug": "tech", "color": "#00CED1" },
    { "id": "scifi", "name": "科幻", "slug": "scifi", "color": "#1E90FF" },
    { "id": "blackwhite", "name": "黑白", "slug": "blackwhite", "color": "#808080" },
    { "id": "dreamy", "name": "梦幻", "slug": "dreamy", "color": "#DDA0DD" },
    { "id": "punk", "name": "朋克", "slug": "punk", "color": "#DC143C" },
    { "id": "vaporwave", "name": "蒸汽波", "slug": "vaporwave", "color": "#FF1493" },
    { "id": "kawaii", "name": "可爱", "slug": "kawaii", "color": "#FFB6D9" },
    { "id": "elegant", "name": "优雅", "slug": "elegant", "color": "#C8A2C8" },
    { "id": "dramatic", "name": "戏剧性", "slug": "dramatic", "color": "#8B0000" },
    { "id": "soft", "name": "柔和", "slug": "soft", "color": "#F5DEB3" },
    { "id": "3d", "name": "3D", "slug": "3d", "color": "#D7DDE5" },
    { "id": "design", "name": "设计", "slug": "design", "color": "#BFE8EA" },
    { "id": "摄影", "name": "摄影", "slug": "photography-cn", "color": "#E8EEF2" },
    { "id": "golden-hour", "name": "黄金时刻", "slug": "golden-hour", "color": "#F6C65B" },
    { "id": "blue-hour", "name": "蓝调时刻", "slug": "blue-hour", "color": "#6FA8DC" },
    { "id": "backlight", "name": "逆光", "slug": "backlight", "color": "#F2D7A0" },
    { "id": "rim-light", "name": "轮廓光", "slug": "rim-light", "color": "#BFD7EA" },
    { "id": "volumetric-light", "name": "体积光", "slug": "volumetric-light", "color": "#D7E8F7" },
    { "id": "low-key", "name": "低调光", "slug": "low-key", "color": "#58606A" },
    { "id": "high-key", "name": "高调光", "slug": "high-key", "color": "#EEF2F5" },
    { "id": "natural-light", "name": "自然光", "slug": "natural-light", "color": "#CDE8C7" },
    { "id": "softbox", "name": "柔光箱", "slug": "softbox", "color": "#E8E2D6" },
    { "id": "hard-light", "name": "硬光", "slug": "hard-light", "color": "#D4A373" },
    { "id": "chiaroscuro", "name": "明暗对照", "slug": "chiaroscuro", "color": "#7D7463" },
    { "id": "bokeh", "name": "散景", "slug": "bokeh", "color": "#F3C4D6" },
    { "id": "depth-of-field", "name": "景深", "slug": "depth-of-field", "color": "#A7C7E7" },
    { "id": "shallow-focus", "name": "浅焦", "slug": "shallow-focus", "color": "#C9D6DF" },
    { "id": "telephoto", "name": "长焦", "slug": "telephoto", "color": "#9FB3C8" },
    { "id": "aerial", "name": "航拍", "slug": "aerial", "color": "#8EC5D6" },
    { "id": "drone-shot", "name": "无人机镜头", "slug": "drone-shot", "color": "#7FB3D5" },
    { "id": "handheld", "name": "手持摄影", "slug": "handheld", "color": "#B0A695" },
    { "id": "long-exposure", "name": "长曝光", "slug": "long-exposure", "color": "#6C7A89" },
    { "id": "motion-blur", "name": "运动模糊", "slug": "motion-blur", "color": "#A5B4FC" },
    { "id": "lens-flare", "name": "镜头光晕", "slug": "lens-flare", "color": "#F8D66D" },
    { "id": "film-grain", "name": "胶片颗粒", "slug": "film-grain", "color": "#B7A99A" },
    { "id": "symmetry", "name": "对称构图", "slug": "symmetry", "color": "#CBD5E1" },
    { "id": "rule-of-thirds", "name": "三分法", "slug": "rule-of-thirds", "color": "#AEC6CF" },
    { "id": "leading-lines", "name": "引导线", "slug": "leading-lines", "color": "#A7B5C7" },
    { "id": "negative-space", "name": "留白", "slug": "negative-space", "color": "#E5E7EB" },
    { "id": "centered-composition", "name": "中心构图", "slug": "centered-composition", "color": "#D1D5DB" },
    { "id": "dutch-angle", "name": "荷兰角", "slug": "dutch-angle", "color": "#B4A7D6" },
    { "id": "film-still", "name": "电影剧照", "slug": "film-still", "color": "#D8DEE9" },
    { "id": "movie-poster", "name": "电影海报", "slug": "movie-poster", "color": "#E9C46A" },
    { "id": "anamorphic", "name": "变形宽银幕", "slug": "anamorphic", "color": "#9AD0EC" },
    { "id": "35mm-film", "name": "35mm 胶片", "slug": "35mm-film", "color": "#C8B6A6" },
    { "id": "16mm-film", "name": "16mm 胶片", "slug": "16mm-film", "color": "#BFA58A" },
    { "id": "imax", "name": "IMAX", "slug": "imax", "color": "#6EA8FE" },
    { "id": "film-noir", "name": "黑色电影", "slug": "film-noir", "color": "#4B5563" },
    { "id": "documentary", "name": "纪录片", "slug": "documentary", "color": "#9CA3AF" },
    { "id": "music-video", "name": "音乐视频", "slug": "music-video", "color": "#C084FC" },
    { "id": "commercial", "name": "商业广告", "slug": "commercial", "color": "#F4A261" },
    { "id": "storyboard", "name": "分镜脚本", "slug": "storyboard", "color": "#D6CCC2" },
    { "id": "color-grading", "name": "调色", "slug": "color-grading", "color": "#8AB6D6" },
    { "id": "teal-orange", "name": "青橙调色", "slug": "teal-orange", "color": "#2A9D8F" },
    { "id": "matte-painting", "name": "数字绘景", "slug": "matte-painting", "color": "#A3B18A" },
    { "id": "digital-painting", "name": "数字绘画", "slug": "digital-painting", "color": "#90BE6D" },
    { "id": "photorealism", "name": "照片级真实", "slug": "photorealism", "color": "#8DD3C7" },
    { "id": "concept-art", "name": "概念艺术", "slug": "concept-art", "color": "#B8C0FF" },
    { "id": "character-design", "name": "角色设计", "slug": "character-design", "color": "#FFCAD4" },
    { "id": "environment-design", "name": "场景设计", "slug": "environment-design", "color": "#B7E4C7" },
    { "id": "creature-design", "name": "生物设计", "slug": "creature-design", "color": "#CDB4DB" },
    { "id": "isometric", "name": "等距视角", "slug": "isometric", "color": "#BDE0FE" },
    { "id": "low-poly", "name": "低多边形", "slug": "low-poly", "color": "#A2D2FF" },
    { "id": "clay-render", "name": "黏土渲染", "slug": "clay-render", "color": "#D7C0AE" },
    { "id": "octane-render", "name": "Octane 渲染", "slug": "octane-render", "color": "#F9C74F" },
    { "id": "unreal-engine", "name": "虚幻引擎", "slug": "unreal-engine", "color": "#8ECAE6" },
    { "id": "product-render", "name": "产品渲染", "slug": "product-render", "color": "#C7D2FE" },
    { "id": "beauty", "name": "美妆", "slug": "beauty", "color": "#F7C6D9" },
    { "id": "glamour", "name": "魅力人像", "slug": "glamour", "color": "#F0A6CA" },
    { "id": "wedding", "name": "婚礼", "slug": "wedding", "color": "#F8EDEB" },
    { "id": "travel", "name": "旅行", "slug": "travel", "color": "#95D5B2" },
    { "id": "food-photography", "name": "美食摄影", "slug": "food-photography", "color": "#F4B183" },
    { "id": "architecture", "name": "建筑", "slug": "architecture", "color": "#BFC0C0" },
    { "id": "interior", "name": "室内空间", "slug": "interior", "color": "#DDBEA9" },
    { "id": "automotive", "name": "汽车", "slug": "automotive", "color": "#A0AEC0" },
    { "id": "product-photography", "name": "产品摄影", "slug": "product-photography", "color": "#DAD7CD" },
    { "id": "wildlife", "name": "野生动物", "slug": "wildlife", "color": "#80B918" },
    { "id": "sports", "name": "运动", "slug": "sports", "color": "#F94144" },
    { "id": "concert", "name": "演唱会", "slug": "concert", "color": "#9B5DE5" },
    { "id": "streetwear", "name": "街头潮流", "slug": "streetwear", "color": "#F15BB5" },
    { "id": "cosplay", "name": "Cosplay", "slug": "cosplay", "color": "#FEE440" },
    { "id": "atmospheric", "name": "氛围感", "slug": "atmospheric", "color": "#A8B5C2" },
    { "id": "moody", "name": "情绪化", "slug": "moody", "color": "#6B7280" },
    { "id": "ethereal", "name": "空灵", "slug": "ethereal", "color": "#D8E2DC" },
    { "id": "surreal", "name": "超现实", "slug": "surreal", "color": "#B8B8FF" },
    { "id": "brutalist", "name": "粗野主义", "slug": "brutalist", "color": "#8D99AE" },
    { "id": "luxury", "name": "奢华", "slug": "luxury", "color": "#D4AF37" },
    { "id": "clean", "name": "干净", "slug": "clean", "color": "#E2E8F0" },
    { "id": "gritty", "name": "粗粝", "slug": "gritty", "color": "#78716C" },
    { "id": "high-contrast", "name": "高对比", "slug": "high-contrast", "color": "#111827" },
]

/**
 * AI 图像生成模型配置
 * 可以在这里添加、删除或修改支持的 AI 模型
 */
export const aiModels = [
    { id: "nano-banana-pro", name: "Nano Banana Pro", provider: "Nano" },
    { id: "nano-banana2", name: "Nano Banana2", provider: "Nano" },
    { id: "midjourney-v6", name: "Midjourney v6", provider: "Midjourney" },
    { id: "midjourney-v7", name: "Midjourney v7", provider: "Midjourney" },
    { id: "midjourney-niji-6", name: "Midjourney Niji 6", provider: "Midjourney" },
    { id: "gpt-Image-2", name: "GPT Image 2", provider: "OpenAI" },
    { id: "dalle-3", name: "DALL-E 3", provider: "OpenAI" },
    { id: "dalle-2", name: "DALL-E 2", provider: "OpenAI" },
    { id: "gpt-image-1.5", name: "GPT Image 1.5", provider: "OpenAI" },
    { id: "flux-pro", name: "Flux Pro", provider: "Black Forest Labs" },
    { id: "flux-dev", name: "Flux Dev", provider: "Black Forest Labs" },
    { id: "flux-schnell", name: "Flux Schnell", provider: "Black Forest Labs" },
    { id: "stable-diffusion-xl", name: "Stable Diffusion XL", provider: "Stability AI" },
    { id: "stable-diffusion-3", name: "Stable Diffusion 3", provider: "Stability AI" },
    { id: "qwen-image", name: "Qwen Image", provider: "Alibaba" },
    { id: "tongyi-wanxiang", name: "通义万相", provider: "Alibaba" },
    { id: "seedream", name: "Seedream", provider: "ByteDance" },
    { id: "adobe-firefly-3", name: "Adobe Firefly 3", provider: "Adobe" },
    { id: "adobe-firefly-2", name: "Adobe Firefly 2", provider: "Adobe" },
    { id: "canva-ai", name: "Canva AI", provider: "Canva" },
    { id: "recraft-v3", name: "Recraft V3", provider: "Recraft" },
    { id: "recraft-v2", name: "Recraft V2", provider: "Recraft" },
    { id: "leonardo-ai", name: "Leonardo AI", provider: "Leonardo.ai" },
    { id: "playground-v2.5", name: "Playground v2.5", provider: "Playground AI" },
    { id: "ideogram-2", name: "Ideogram 2.0", provider: "Ideogram" },
    { id: "ideogram-1", name: "Ideogram 1.0", provider: "Ideogram" },
    { id: "other", name: "其他", provider: "Other" },
] as const

/**
 * 后台表单和上传接口默认值。
 * 修改这里比在组件/API 里找硬编码更稳；如果默认模型被删除，表单会自动回退到模型列表第一项。
 */
export const promptStatusIds = {
    published: "published",
    draft: "draft",
    archived: "archived",
} as const

export const appDefaults = {
    prompt: {
        categoryId: "photography",
        modelId: "nano-banana-pro",
        aspectRatio: "2:3",
        status: promptStatusIds.published,
    },
    tag: {
        color: "#94a3b8",
    },
    upload: {
        maxUploadSize: 10 * 1024 * 1024,
        maxDimension: 3000,
        thumbnailDimension: 640,
        webpQuality: 90,
        thumbnailQuality: 92,
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
} as const

export const aspectRatioOptions = [
    { value: "1:1", label: "1:1 (Square)" },
    { value: "2:3", label: "2:3 (Portrait)" },
    { value: "3:2", label: "3:2 (Landscape)" },
    { value: "3:4", label: "3:4 (Portrait)" },
    { value: "4:3", label: "4:3 (Landscape)" },
    { value: "16:9", label: "16:9 (Wide)" },
    { value: "9:16", label: "9:16 (Story)" },
    { value: "21:9", label: "21:9 (Ultrawide)" },
    { value: "9:21", label: "9:21 (Tall)" },
] as const

export const promptStatusOptions = [
    { value: promptStatusIds.published, label: "已发布" },
    { value: promptStatusIds.draft, label: "草稿" },
    { value: promptStatusIds.archived, label: "归档" },
] as const

export const promptStatusValues = promptStatusOptions.map((option) => option.value)

export function isPromptStatus(value: unknown): value is Prompt["status"] {
    return typeof value === "string" && promptStatusValues.includes(value as Prompt["status"])
}

export function isPublishedPrompt(prompt: Pick<Prompt, "status">): boolean {
    return prompt.status === appDefaults.prompt.status
}

export function getPromptStatusLabel(status: Prompt["status"]): string {
    return promptStatusOptions.find((option) => option.value === status)?.label || status
}

/**
 * 常用标签建议（用于标签输入的自动完成）
 * 这些是最常用的标签，会在输入时作为建议显示
 */
export const popularTagSuggestions = [
    "portrait", "landscape", "minimalist", "cinematic", "street",
    "japanese", "korean", "tech", "scifi", "cyberpunk",
    "anime", "vibrant", "dark", "fantasy", "realistic",
    "abstract", "retro", "futuristic", "dreamy", "elegant",
    "fashion", "editorial", "artistic", "watercolor", "sketch",
    "neon", "monochrome", "pastel", "kawaii", "dramatic",
    "nature", "urban", "vintage", "modern", "classic",
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
