# 网站配置说明

## 概述

所有网站配置现在集中在 `lib/config.ts` 文件中，方便您统一管理和修改网站内容。

##配置结构

### 1. 站点基本信息 (`siteConfig`)

```typescript
export const siteConfig = {
  name: "Nano Gallery",                    // 网站名称
  description: "探索数千个免费的...",       // 网站描述
  metadata: {
    title: "Nano Gallery - AI Prompts...", // 浏览器标题
    description: "...",                     // SEO 描述
    keywords: ["AI", "Prompts", ...],      // SEO 关键词
  },
  copyright: {
    year: "2026",                          // 版权年份
    text: "探索无限创意可能",               // 版权文本
  },
  admin: {
    name: "Nano Admin",                    // 管理后台名称
    title: "管理您的 Prompt 画廊内容",     // 管理后台标题
  },
}
```

### 2. 分类配置 (`categories`)

在 `lib/config.ts` 中的 `categories` 数组中添加、删除或修改分类：

```typescript
export const categories: Category[] = [
  { 
    id: "photography",              // 唯一标识
    name: "摄影",               // 显示名称
    slug: "photography",            // URL 路径
    description: "真实摄影风格...", // 描述
    order: 1,                       // 排序
    enabled: true                   // 是否启用
  },
  // ... 更多分类
]
```

### 3. 标签配置 (`tags`)

在 `lib/config.ts` 中的 `tags` 数组中管理标签：

```typescript
export const tags: Tag[] = [
  { 
    id: "portrait",                 // 唯一标识
    name: "肖像",                   // 显示名称
    slug: "portrait",               // URL 路径
    color: "#FF6B6B"                // 标签颜色
  },
  // ... 更多标签
]
```

### 4. UI 文本配置 (`uiText`)

管理界面文本，包括导航、按钮、提示信息等：

```typescript
export const uiText = {
  navigation: {
    all: "全部",
    today: "今日",
    // ...
  },
  buttons: {
    loadMore: "加载更多作品",
    copy: "复制",
    // ...
  },
  // ...
}
```

## 如何修改

### 修改网站名称

打开 `lib/config.ts`，找到：

```typescript
export const siteConfig = {
  name: "Nano Gallery",  // 修改这里
  // ...
}
```

修改后，网站名称会自动在以下位置更新：
- 页面标题
- 侧边栏 Logo
- 页脚版权信息

### 添加新分类

在 `lib/config.ts` 的 `categories` 数组中添加：

```typescript
{
  id: "new-category",
  name: "新分类",
  slug: "new-category",
  description: "分类描述",
  order: 11,
  enabled: true
}
```

### 修改版权信息

```typescript
copyright: {
  year: "2026",              // 修改年份
  text: "您的自定义文本",    // 修改描述
},
```

## 注意事项

1. **保持一致性**：修改 `id` 和 `slug` 时要确保唯一性
2. **重启服务**：修改配置后需要重启开发服务器 (`npm run dev`)
3. **备份**：修改前建议备份 `lib/config.ts` 文件
4. **类型安全**：TypeScript 会帮您检查配置的正确性

## 常见问题

**Q: 修改后没有生效？**
A: 请重启开发服务器 (`Ctrl+C` 然后重新运行 `npm run dev`)

**Q: 可以添加自定义配置吗？**
A: 可以！在 `siteConfig` 对象中添加新字段即可

**Q: 如何恢复默认配置？**
A: 从 Git 历史恢复 `lib/config.ts` 文件，或参考文档重新配置
