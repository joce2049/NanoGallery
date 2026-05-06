/**
 * 模拟数据 - 用于开发和演示
 */

import type { Prompt, DailyStat } from "./types"
import { categories, tags } from "./config"

// 直接从配置文件导出分类和标签
export { categories, tags }

export const prompts: Prompt[] = [
    {
        id: "1",
        title: "Urban Fisheye Flash Contrast Portrait",
        content: "A striking urban portrait taken with a fisheye lens, dramatic flash lighting creating high contrast shadows, street photography style, modern fashion aesthetic, vibrant city background, dynamic composition",
        description: "都市鱼眼闪光对比肖像",
        imageUrl: "/urban-fisheye-flash-portrait.jpg",
        categoryId: "photography",
        tags: ["portrait", "cinematic", "fashion"],
        metadata: {
            model: "Midjourney v6",
            aspectRatio: "2:3",
            style: "raw",
        },
        status: "published",
        views: 2340,
        copies: 234,
        likes: 567,
        createdAt: new Date("2026-01-10"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-10"),
    },
    {
        id: "2",
        title: "Pure White 3D Monthly Icons",
        content: "12 minimalist 3D icons representing each month of the year, pure white design with soft shadows, clean aesthetic, modern UI design, floating composition, monochromatic palette",
        description: "纯白 3D 月份图标",
        imageUrl: "/3d-white-monthly-icons.jpg",
        categoryId: "3d",
        tags: ["minimalist", "3d", "design"],
        metadata: {
            model: "DALL-E 3",
            aspectRatio: "1:1",
        },
        status: "published",
        views: 1890,
        copies: 189,
        likes: 421,
        createdAt: new Date("2026-01-09"),
        updatedAt: new Date("2026-01-12"),
        publishedAt: new Date("2026-01-09"),
    },
    {
        id: "3",
        title: "Melancholic White Frame Editorial",
        content: "Editorial fashion photography with melancholic mood, subject framed by white architectural elements, soft natural window lighting, muted color palette, artistic portrait, contemplative expression",
        description: "忧郁白框编辑肖像",
        imageUrl: "/melancholic-editorial-portrait.jpg",
        categoryId: "photography",
        tags: ["portrait", "editorial", "minimalist"],
        metadata: {
            model: "Midjourney v6",
            aspectRatio: "4:5",
        },
        status: "published",
        views: 4210,
        copies: 421,
        likes: 892,
        createdAt: new Date("2026-01-08"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-08"),
    },
    {
        id: "4",
        title: "Real-Cartoon Street Portrait",
        content: "Hybrid style portrait seamlessly blending photorealistic features with cartoon elements, vibrant street background with graffiti, playful artistic expression, bold colors, creative digital art",
        description: "真实卡通街头肖像",
        imageUrl: "/real-cartoon-street-portrait.jpg",
        categoryId: "ai-art",
        tags: ["portrait", "vibrant", "artistic"],
        metadata: {
            model: "Stable Diffusion XL",
            aspectRatio: "2:3",
        },
        status: "published",
        views: 3120,
        copies: 312,
        likes: 678,
        createdAt: new Date("2026-01-11"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-11"),
    },
    {
        id: "5",
        title: "Seagull Freedom Portrait",
        content: "Cinematic portrait with seagull in flight above subject, freedom and liberation concept, golden hour lighting, coastal setting with ocean backdrop, emotional depth, wide angle composition",
        description: "海鸥自由肖像",
        imageUrl: "/seagull-freedom-portrait.jpg",
        categoryId: "photography",
        tags: ["portrait", "cinematic", "outdoor"],
        metadata: {
            model: "Midjourney v6",
            aspectRatio: "16:9",
        },
        status: "published",
        views: 5670,
        copies: 567,
        likes: 1243,
        createdAt: new Date("2026-01-07"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-07"),
    },
    {
        id: "6",
        title: "Underwater Macro Half-Face Close-up",
        content: "Extreme macro underwater photography, half-face composition with water surface splitting the frame, crystal clear water with visible bubbles, dreamy bokeh background, surreal aesthetic, refreshing mood",
        description: "水下微距半脸特写",
        imageUrl: "/underwater-macro-closeup.jpg",
        categoryId: "photography",
        tags: ["macro", "closeup", "artistic"],
        metadata: {
            model: "Midjourney v6",
            aspectRatio: "1:1",
        },
        status: "published",
        views: 2890,
        copies: 289,
        likes: 634,
        createdAt: new Date("2026-01-12"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-12"),
    },
    {
        id: "7",
        title: "Luxurious Triptych Fashion Portrait",
        content: "High-end fashion triptych showing three complementary poses, luxurious styling with designer clothing, professional studio lighting setup, three-panel composition, magazine editorial quality, elegant and sophisticated",
        description: "奢华三联时尚肖像",
        imageUrl: "/luxury-fashion-portrait.png",
        categoryId: "photography",
        tags: ["fashion", "editorial", "studio"],
        metadata: {
            model: "Midjourney v6",
            aspectRatio: "3:1",
        },
        status: "published",
        views: 4450,
        copies: 445,
        likes: 967,
        createdAt: new Date("2026-01-06"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-06"),
    },
    {
        id: "8",
        title: "Photorealistic Supermodel Walk in the Rain",
        content: "Photorealistic runway walk in pouring rain, model in haute couture, dramatic lighting with reflective wet surfaces, high fashion photography aesthetic, cinematic atmosphere, water droplets in motion",
        description: "超模雨中行走",
        imageUrl: "/supermodel-rain-walk.jpg",
        categoryId: "photography",
        tags: ["fashion", "cinematic", "realistic"],
        metadata: {
            model: "Midjourney v6",
            aspectRatio: "2:3",
            style: "raw",
        },
        status: "published",
        views: 6780,
        copies: 678,
        likes: 1456,
        createdAt: new Date("2026-01-05"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-05"),
    },
    {
        id: "9",
        title: "Minimalist Intellectual Glasses Girl",
        content: "Clean minimalist portrait featuring subject with stylish glasses, intellectual aesthetic, soft diffused lighting, simple neutral background, focus on facial features and expression, modern and clean composition",
        description: "极简知性眼镜女孩",
        imageUrl: "/minimalist-glasses-portrait.png",
        categoryId: "photography",
        tags: ["portrait", "minimalist", "studio"],
        metadata: {
            model: "DALL-E 3",
            aspectRatio: "4:5",
        },
        status: "published",
        views: 2340,
        copies: 234,
        likes: 512,
        createdAt: new Date("2026-01-13"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-13"),
    },
    {
        id: "10",
        title: "Fitness Innocent-Sexy Photos",
        content: "Athletic fitness photography showcasing natural beauty, energetic and confident pose, clean aesthetic with professional lighting, studio setting with minimal props, healthy and positive vibe",
        description: "健身清新性感照片",
        imageUrl: "/fitness-portrait.jpg",
        categoryId: "photography",
        tags: ["portrait", "studio", "vibrant"],
        metadata: {
            model: "Midjourney v6",
            aspectRatio: "2:3",
        },
        status: "published",
        views: 5120,
        copies: 512,
        likes: 1089,
        createdAt: new Date("2026-01-04"),
        updatedAt: new Date("2026-01-13"),
        publishedAt: new Date("2026-01-04"),
    },
    {
        id: "11",
        title: "Ultra-realistic 3D Isometric View",
        content: "3D isometric architectural visualization with ultra-realistic rendering, detailed textures and materials, modern design with clean lines, perfect lighting and shadows, professional architectural presentation",
        description: "超写实 3D 等距视图",
        imageUrl: "/3d-isometric-architecture.jpg",
        categoryId: "3d",
        tags: ["3d", "realistic", "minimalist"],
        metadata: {
            model: "Blender + AI Enhancement",
            aspectRatio: "1:1",
        },
        status: "published",
        views: 3890,
        copies: 389,
        likes: 823,
        createdAt: new Date("2026-01-03"),
        updatedAt: new Date("2026-01-12"),
        publishedAt: new Date("2026-01-03"),
    },
    {
        id: "12",
        title: "3x3 Grid Photo Collage",
        content: "Creative 3x3 photo grid collage with cohesive color palette, storytelling composition showing different moments and angles, editorial style presentation, harmonious visual flow between images",
        description: "3x3 网格照片拼贴",
        imageUrl: "/photo-collage-grid.jpg",
        categoryId: "illustration",
        tags: ["editorial", "artistic", "vibrant"],
        metadata: {
            model: "Photoshop + Midjourney",
            aspectRatio: "1:1",
        },
        status: "published",
        views: 2670,
        copies: 267,
        likes: 589,
        createdAt: new Date("2026-01-02"),
        updatedAt: new Date("2026-01-11"),
        publishedAt: new Date("2026-01-02"),
    },
]

// 生成模拟的统计数据（过去 30 天）
export const generateMockStats = (): DailyStat[] => {
    const stats: DailyStat[] = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        prompts.forEach((prompt) => {
            // 随机生成每日浏览量和复制量
            const views = Math.floor(Math.random() * 100) + 10
            const copies = Math.floor(views * (Math.random() * 0.3 + 0.1)) // 10-40% 转化率

            stats.push({
                date: dateStr,
                promptId: prompt.id,
                views,
                copies,
            })
        })
    }

    return stats
}

export const dailyStats = generateMockStats()
