# NanoGallery UI 设计规范

> 本文档由源码逐维度提取并对照核验生成，是全站 UI / 样式的**唯一参照标准**。
> 新增或修改任何界面、组件、配色、图标、线条粗细、间距、圆角、阴影、动效时，**先对照本文档**；改动落地后，请更新对应章节并在文末「变更记录」登记（日期 · 提交号 · 章节 · 摘要）。
>
> **技术栈**：Next.js 16 (App Router) · React 19 · Tailwind CSS v4（`@theme inline`）· shadcn/ui（new-york 中性色板）· next-themes（class 策略）· lucide-react · sonner · Radix UI。
> **主题机制**：明暗通过根元素 `.dark` 类切换（`@custom-variant dark (&:is(.dark *))`）；颜色一律用语义令牌（`bg-background` / `text-foreground` / `text-muted-foreground` / `border-border` …），**禁止硬编码色值**。
> **浮层文字色**：Dialog / AlertDialog 基类已统一为主题自适应 `text-foreground`（明暗都可读）；仅"强制深色 / 彩底表面"（登录弹窗、图上浮动控件）需逐元素显式给色（详见「玻璃拟态与浮层规范」§6.6）。
>
> **最后更新**：2026-07-22

## 目录

1. [设计令牌与主题变量](#sec-1)
2. [色彩语义与调色板](#sec-2)
3. [字体与排版](#sec-3)
4. [间距、布局与断点](#sec-4)
5. [圆角 · 描边 · 分割线 · 阴影 · 模糊](#sec-5)
6. [玻璃拟态与浮层规范](#sec-6)
7. [按钮规范](#sec-7)
8. [图标规范](#sec-8)
9. [表单控件](#sec-9)
10. [卡片 · 徽章 · 标签 · 统计](#sec-10)
11. [导航与侧边栏](#sec-11)
12. [画廊 · 图片弹窗 · 动效 · 通知](#sec-12)

---

<a id="sec-1"></a>

## 1. 设计令牌与主题变量

本章是整份规范的地基。所有颜色、圆角、字体、滚动条、瀑布流布局的取值均来自 `src/app/globals.css`（Tailwind v4 + shadcn/ui new-york 中性色板）。以后任何页面的配色/尺寸都必须引用这里的 CSS 变量或其映射出的 Tailwind 工具类，不得硬编码色值。

> 说明：本项目基于 Tailwind v4 的 `@theme inline`。文件顶部依次为 `@import "tailwindcss"`（`src/app/globals.css:1`）、`@import "tw-animate-css"`（`src/app/globals.css:2`），并声明暗色变体 `@custom-variant dark (&:is(.dark *))`（`src/app/globals.css:4`），即暗色模式通过祖先元素带 `.dark` 类触发。

### 一、颜色令牌明暗对照表

所有色值均为 `oklch(L C H)` 原值，hex 为近似换算（灰阶为纯灰、无色相，红色/图表色为估算，UI 落地请以 oklch 变量为准）。明亮定义于 `:root`（`src/app/globals.css:6-40`），暗色定义于 `.dark`（`src/app/globals.css:42-75`）。

| 变量 | 明亮 `:root` oklch | 明亮近似 hex | 暗色 `.dark` oklch | 暗色近似 hex |
|---|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#0a0a0a` |
| `--foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | `oklch(0.985 0 0)` | `#fafafa` |
| `--card` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#0a0a0a` |
| `--card-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | `oklch(0.985 0 0)` | `#fafafa` |
| `--popover` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#0a0a0a` |
| `--popover-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | `oklch(0.985 0 0)` | `#fafafa` |
| `--primary` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.205 0 0)` | `#171717` |
| `--secondary` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` |
| `--muted` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#737373` | `oklch(0.708 0 0)` | `#a1a1a1` |
| `--accent` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` |
| `--accent-foreground` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | ≈`#dc2626` | `oklch(0.396 0.141 25.723)` | ≈`#7f2323` |
| `--destructive-foreground` | `oklch(0.577 0.245 27.325)` | ≈`#dc2626` | `oklch(0.637 0.237 25.331)` | ≈`#ef4444` |
| `--border` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#262626` |
| `--input` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#262626` |
| `--ring` | `oklch(0.708 0 0)` | `#a1a1a1` | `oklch(0.439 0 0)` | `#525252` |
| `--chart-1` | `oklch(0.646 0.222 41.116)` | ≈`#e8703a` 橙 | `oklch(0.488 0.243 264.376)` | ≈`#4548d8` 蓝紫 |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | ≈`#39a0a0` 青 | `oklch(0.696 0.17 162.48)` | ≈`#35b389` 绿 |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | ≈`#2b4a5e` 深蓝 | `oklch(0.769 0.188 70.08)` | ≈`#eaa93a` 橙黄 |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | ≈`#eac53f` 黄 | `oklch(0.627 0.265 303.9)` | ≈`#a84cd6` 紫 |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | ≈`#eaa93a` 橙黄 | `oklch(0.645 0.246 16.439)` | ≈`#e0405a` 红粉 |

**侧边栏专属令牌**（`--sidebar*`，明亮 `src/app/globals.css:32-39`，暗色 `src/app/globals.css:67-74`）——注意侧边栏底色是独立变量，明亮下 `--sidebar` 比 `--background` 略灰、暗色下比 `--background` 略亮，不要用 `bg-background` 代替：

| 变量 | 明亮 oklch | 明亮近似 hex | 暗色 oklch | 暗色近似 hex |
|---|---|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.205 0 0)` | `#171717` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | `oklch(0.985 0 0)` | `#fafafa` |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.488 0.243 264.376)` | ≈`#4548d8` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.985 0 0)` | `#fafafa` |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#262626` |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `#a1a1a1` | `oklch(0.439 0 0)` | `#525252` |

**必须遵守的坑与约定：**
- **中性主题、无品牌主色。** `--primary` 在明亮下是近黑（`#171717`），暗色下是近白（`#fafafa`）——它是“反色强调”，不是彩色。任何“主色按钮”在明暗两种模式下前景/背景会整体反转，写组件时只用 `bg-primary text-primary-foreground` 这一对，绝不要写死黑白。
- **`--destructive` 与 `--destructive-foreground` 在明亮模式下取值完全相同**（都是 `oklch(0.577 0.245 27.325)`，`src/app/globals.css:21-22`）。这意味着在浅色下用 `bg-destructive text-destructive-foreground` 会得到“红底红字”不可读。危险色在浅色场景下应作为**文字/边框色**（`text-destructive`）使用，做红底填充时必须显式指定白色前景（如 `text-white`），不能依赖 `text-destructive-foreground`。注意暗色下二者已拆开（背景 `oklch(0.396 0.141 25.723)` 深红、前景 `oklch(0.637 0.237 25.331)` 亮红），该坑仅在明亮模式暴露。
- **`--muted` 与 `--secondary`、`--accent` 在同一模式下同值**（明亮均 `oklch(0.97 0 0)`，暗色均 `oklch(0.269 0 0)`）。三者视觉上等价，语义区分靠命名而非颜色。
- **`--border` 与 `--input` 同值**（明亮 `oklch(0.922 0 0)`，暗色 `oklch(0.269 0 0)`）。
- **`--ring` 与 `--sidebar-ring` 同值**，明亮 `oklch(0.708 0 0)`、暗色 `oklch(0.439 0 0)`。
- 浮层（`popover`/`card`）在明暗下与 `background` 同底色，靠边框与阴影区分层级。浮层内文字颜色继承坑详见按钮/浮层章节：浮层里放主色按钮时，务必让按钮自带 `text-primary-foreground`，否则会继承浮层的 `--popover-foreground`。

### 二、`@theme inline` 令牌映射（`src/app/globals.css:77-116`）

`@theme inline` 把上面每个 `--xxx` 变量注册成 Tailwind 的 `--color-xxx`，从而生成 `bg-*`/`text-*`/`border-*`/`ring-*` 工具类。映射一律是 `--color-<名> : var(--<名>)`，一一对应，无重命名（`src/app/globals.css:80-103, 108-115`）。可用工具类前缀清单：

`background`、`foreground`、`card`、`card-foreground`、`popover`、`popover-foreground`、`primary`、`primary-foreground`、`secondary`、`secondary-foreground`、`muted`、`muted-foreground`、`accent`、`accent-foreground`、`destructive`、`destructive-foreground`、`border`、`input`、`ring`、`chart-1..5`、`sidebar`、`sidebar-foreground`、`sidebar-primary(-foreground)`、`sidebar-accent(-foreground)`、`sidebar-border`、`sidebar-ring`。

即：`bg-background`、`text-foreground`、`bg-card`、`text-muted-foreground`、`border-border`、`ring-ring`、`bg-sidebar-accent` 等均可直接使用。

### 三、圆角令牌与派生（`src/app/globals.css:31, 104-107`）

基准 `--radius: 0.625rem = 10px`（`src/app/globals.css:31`）。`@theme inline` 派生四档，映射为 Tailwind 的 `rounded-sm/md/lg/xl`：

| Tailwind 类 | 令牌 | 计算式 | 结果 rem | 结果 px |
|---|---|---|---|---|
| `rounded-sm` | `--radius-sm` | `calc(var(--radius) - 4px)` | 0.375rem | **6px** |
| `rounded-md` | `--radius-md` | `calc(var(--radius) - 2px)` | 0.5rem | **8px** |
| `rounded-lg` | `--radius-lg` | `var(--radius)` | 0.625rem | **10px** |
| `rounded-xl` | `--radius-xl` | `calc(var(--radius) + 4px)` | 0.875rem | **14px** |

改全局圆角只需改 `--radius` 一处，四档随之等比偏移。`rounded-full`（滚动条等使用）不受此表约束，仍是标准 9999px。

### 四、字体族令牌（`src/app/globals.css:78-79`）

| 令牌 / 工具类 | 值 |
|---|---|
| `--font-sans`（`font-sans`） | `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif` |
| `--font-mono`（`font-mono`） | `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace` |

均为系统字体栈（无 Web Font 加载），中文优先 PingFang SC → 冬青黑 → 微软雅黑。等宽用于 Prompt 代码/复制文本区。

### 五、全局基础样式（`@layer base`，`src/app/globals.css:118-126`）

```css
* { @apply border-border outline-ring/50; }
body { @apply bg-background text-foreground; }
```

- 通配 `*` 默认边框色为 `--border`（因此写 `border` 类时无需再指定颜色即得主题边框色），默认聚焦轮廓为 `--ring` 的 **50% 不透明度**（`outline-ring/50`）。
- `body` 底色 `--background`、文字色 `--foreground`，随明暗自动切换。页面容器不必重复声明底色。

### 六、自定义滚动条（`@layer base`，`src/app/globals.css:176-189`）

```css
::-webkit-scrollbar        { width: 8px; height: 8px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { @apply bg-border/50 rounded-full hover:bg-border; }
```

| 部件 | 属性 | 值 |
|---|---|---|
| 滚动条整体 | `width` / `height` | 8px / 8px |
| track 轨道 | `background` | `transparent`（透明，不占视觉） |
| thumb 滑块 | 背景 | `--border` 的 **50% 不透明度**（`bg-border/50`） |
| thumb 滑块 | 圆角 | `rounded-full`（全圆角胶囊） |
| thumb hover | 背景 | `--border` **100%**（`hover:bg-border`） |

仅 WebKit（Chrome/Safari/Edge）生效；Firefox 无对应规则。滑块颜色跟随主题 border，明暗自适应。

### 七、瀑布流与工具类（`@layer utilities`，`src/app/globals.css:128-174`）

`.masonry-grid` 用原生 CSS `column-count` 实现响应式多列瀑布流，列数随断点递增（另含 `width: 100%`，`src/app/globals.css:133`）：

| 断点（min-width） | `column-count` | `column-gap` | 来源 |
|---|---|---|---|
| 默认（< 640px） | 2 | `0.5rem` = 8px | `src/app/globals.css:130-134` |
| `sm` ≥ 640px | 2 | `0.75rem` = 12px | `src/app/globals.css:136-141` |
| `lg` ≥ 1024px | 3 | `0.75rem` = 12px | `src/app/globals.css:143-148` |
| `xl` ≥ 1280px | 4 | `0.75rem` = 12px | `src/app/globals.css:150-155` |

`.masonry-item`（`src/app/globals.css:157-169`）——单个卡片的防断裂规则：

| 属性 | 值 |
|---|---|
| `break-inside` | `avoid`（禁止卡片被拆到两列） |
| `display` | `inline-block` |
| `width` | `100%` |
| `vertical-align` | `top` |
| `margin-bottom` | 默认 `0.5rem`（8px，`src/app/globals.css:159`）；`sm` ≥ 640px 起 `0.75rem`（12px，`src/app/globals.css:165-169`） |

**约定：** 卡片纵向间距由 `.masonry-item` 的 `margin-bottom` 控制，横向间距由 `.masonry-grid` 的 `column-gap` 控制，二者在 `sm` 断点起统一为 12px，其下为 8px。往瀑布流里塞的每个卡片外层必须加 `.masonry-item`，否则会跨列断裂。

`.scroll-smooth`（`src/app/globals.css:171-173`）：`scroll-behavior: smooth`，用于锚点/返回顶部平滑滚动。

### 八、动画

`globals.css` 内**没有任何 `@keyframes` 定义**。动画能力来自顶部 `@import "tw-animate-css"`（`src/app/globals.css:2`）提供的动画工具类（如 `animate-in`/`fade-in`/`zoom-in` 等），本文件未新增自定义关键帧。若需新增项目级关键帧动画，应补在此文件的 `@layer utilities` 内并在此表登记。

---

<a id="sec-2"></a>

## 2. 色彩语义与调色板

本章是所有 UI 配色的唯一事实来源。项目采用 **Tailwind CSS v4 + shadcn/ui** 体系，颜色以「语义 token」为核心，全部用 **oklch** 色彩空间定义在 `src/app/globals.css` 的 `:root`（浅色）与 `.dark`（暗色）两套变量里，再通过 `@theme inline` 映射成 `--color-*` 供 `bg-*` / `text-*` / `border-*` 等工具类使用。

**铁律：任何页面/组件不得直接写死颜色（除少数品牌渐变与 tag.color 底色外），必须用语义 token 对应的工具类（`bg-background`、`text-muted-foreground` 等），以保证暗色模式与主题一致性。**

### 1. 语义 token 总表（浅色 / 暗色）

所有变量在 `src/app/globals.css:6-40`（`:root`）与 `src/app/globals.css:42-75`（`.dark`）定义，随后在 `@theme inline`（`globals.css:77-116`）里映射成 `--color-*` 工具类色。近似 hex 为 sRGB 换算，仅供直觉参考，**落地实现请始终用 oklch 原值或对应工具类**。

| Token（CSS 变量 / 工具类后缀） | 浅色 oklch | 浅色≈hex | 暗色 oklch | 暗色≈hex | 语义与用途 |
|---|---|---|---|---|---|
| `--background` / `bg-background` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#242424` | 页面/画布最底色。`body` 全局应用（`globals.css:124`），`ClientGallery` 根容器 `bg-background`（`client-gallery.tsx:142`） |
| `--foreground` / `text-foreground` | `oklch(0.145 0 0)` | `#242424` | `oklch(0.985 0 0)` | `#fafafa` | 正文主文字色，`body` 全局默认（`globals.css:124`） |
| `--card` / `bg-card` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#242424` | 卡片/面板底，与 background 同值但语义独立 |
| `--card-foreground` | `oklch(0.145 0 0)` | `#242424` | `oklch(0.985 0 0)` | `#fafafa` | 卡片内文字 |
| `--popover` / `bg-popover` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#242424` | 浮层（下拉、Popover、Select 面板）底 |
| `--popover-foreground` | `oklch(0.145 0 0)` | `#242424` | `oklch(0.985 0 0)` | `#fafafa` | 浮层内文字 |
| `--primary` / `bg-primary` | `oklch(0.205 0 0)` | `#333333` | `oklch(0.985 0 0)` | `#fafafa` | 主行动色。**注意浅/暗反相**：浅色是近黑，暗色是近白 |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.205 0 0)` | `#333333` | 主按钮上的文字（与 primary 反相） |
| `--secondary` / `bg-secondary` | `oklch(0.97 0 0)` | `#f7f7f7` | `oklch(0.269 0 0)` | `#454545` | 次级填充（次级按钮、`Badge secondary` 底） |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `#333333` | `oklch(0.985 0 0)` | `#fafafa` | 次级填充上文字 |
| `--muted` / `bg-muted` | `oklch(0.97 0 0)` | `#f7f7f7` | `oklch(0.269 0 0)` | `#454545` | 弱化背景（骨架、占位、分隔区块） |
| `--muted-foreground` / `text-muted-foreground` | `oklch(0.556 0 0)` | `#8a8a8a` | `oklch(0.708 0 0)` | `#b4b4b4` | 次要/说明文字。全站高频使用：Hero 副标题、计数 pill、footer、加载文案（`client-gallery.tsx:149,152,229,257`） |
| `--accent` / `bg-accent` | `oklch(0.97 0 0)` | `#f7f7f7` | `oklch(0.269 0 0)` | `#454545` | 悬停高亮底（hover 态、被选中区） |
| `--accent-foreground` | `oklch(0.205 0 0)` | `#333333` | `oklch(0.985 0 0)` | `#fafafa` | accent 区上文字 |
| `--destructive` / `bg-destructive` | `oklch(0.577 0.245 27.325)` | `#dc2626` 级红 | `oklch(0.396 0.141 25.723)` | 暗红 | 危险/破坏性操作（删除等）语义色 |
| `--destructive-foreground` | `oklch(0.577 0.245 27.325)` | 红 | `oklch(0.637 0.237 25.331)` | 亮红 | destructive 前景（注意见下方「坑」） |
| `--border` / `border-border` | `oklch(0.922 0 0)` | `#e8e8e8` | `oklch(0.269 0 0)` | `#454545` | 全局默认描边。`* { @apply border-border outline-ring/50 }`（`globals.css:120`），滚动条 thumb 亦用 `bg-border/50`（`globals.css:187`） |
| `--input` / `border-input` | `oklch(0.922 0 0)` | `#e8e8e8` | `oklch(0.269 0 0)` | `#454545` | 表单控件描边（Input/Textarea/Select） |
| `--ring` / `ring-ring` | `oklch(0.708 0 0)` | `#b4b4b4` | `oklch(0.439 0 0)` | `#6b6b6b` | 焦点环颜色。全局 outline `outline-ring/50`（`globals.css:120`） |
| `--sidebar` 系列（8 个） | 见下 | — | 见下 | — | 侧边栏专用配色，见第 3 节 |

`--radius: 0.625rem`（=10px，`globals.css:31`）是圆角基准，派生 `--radius-sm/md/lg/xl` = `radius-4px / -2px / +0 / +4px`（`globals.css:104-107`）。图表色 `--chart-1..5`（`globals.css:26-30` / `62-66`）仅用于数据可视化，本画廊 UI 未使用，此处不展开。

### 2. 语义 token 的使用约定（何时用哪个）

- **`background` vs `card` vs `popover`**：三者浅色都是纯白、暗色都是 `oklch(0.145)`，但语义不可混用。页面画布用 `background`；独立卡片/内容块用 `card`；**任何浮在内容之上的层（Dropdown / Select 面板 / Popover / Dialog 内容）用 `popover`**，以便未来单独调层色而不牵连全局。
- **`primary` 是「反相」色**：浅色近黑、暗色近白。主按钮 `default` variant = `bg-primary text-primary-foreground hover:bg-primary/90`（`button.tsx:14`）。排序「最新/热门/趋势」选中态即用 `variant="default"`，未选中用 `outline`（`client-gallery.tsx:169,176,183`）。**不要假设 primary 一定是深色**——写文字色务必配对使用 `text-primary-foreground`，否则暗色下白底白字。
- **`secondary`**：次级填充，比 primary 轻。`Badge secondary` = `bg-secondary text-secondary-foreground`（hover `[a&]:hover:bg-secondary/90`，`badge.tsx:16-17`），标签胶囊即基于此（见第 4 节）。
- **`muted` / `muted-foreground`**：`muted` 作弱背景，`muted-foreground` 是全站最常用的「次要文字色」——副标题、计数、footer、加载提示都用它。骨架/占位渐变用 `from-muted via-muted/70 to-background`（`image-card.tsx:36`）。
- **`accent` / `accent-foreground`**：交互 hover 态。`outline`/`ghost` 按钮 hover 用 `hover:bg-accent hover:text-accent-foreground`（`button.tsx:18,22`）；Hero 计数 pill 用带透明度的 `bg-accent/50 dark:bg-accent/20`（`client-gallery.tsx:153,156`）。
- **`border` vs `input`**：普通分隔/描边用 `border`；表单控件描边用 `input`（`input.tsx` / `textarea.tsx` / `select.tsx` 均用 `border-input`）。二者当前同值，但语义分开，改表单描边不要动 `border`。
- **`ring`**：仅焦点态。控件聚焦统一 `focus-visible:ring-ring/50 focus-visible:ring-[3px]`（**焦点环宽度固定 3px**，见 `button.tsx:10`、`badge.tsx:10`），配合 `focus-visible:border-ring`。校验失败态改用 `aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40`（同 `button.tsx:10` / `badge.tsx:10`）。

### 3. Sidebar 专用配色

侧边栏有独立 8 色 token（`globals.css:32-39` / `67-74`），**暗色下 sidebar 与主内容刻意错开明度**（`--sidebar` 暗色 = `oklch(0.205)` 比 `background` 的 `0.145` 略亮，形成层次）。

| Token | 浅色 oklch | 暗色 oklch | 用途 |
|---|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` `#fafafa` | `oklch(0.205 0 0)` `#333333` | 侧栏底色 |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | 侧栏文字 |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.376)`（蓝紫） | 侧栏主/激活项 |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | 激活项文字 |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | 侧栏 hover 底 |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | hover 项文字 |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(0.269 0 0)` | 侧栏分隔线 |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.439 0 0)` | 侧栏焦点环 |

### 4. 标签色板（tag.color + `20` alpha 底规则）

标签调色板是**唯一由数据驱动**的彩色系统。每个标签在 `src/config.ts:129-249` 的 `tags` 数组里携带一个 6 位十六进制 `color`（**共 119 个标签**，条目位于 `config.ts:130-248`）。

渲染规则在 `src/features/tags/components/tag-badge.tsx:31-39`：胶囊基于 shadcn `Badge variant="secondary"`（即默认 `bg-secondary text-secondary-foreground`），再用**内联 style 覆盖背景**（`tag-badge.tsx:35`）：

```tsx
<Badge
  variant="secondary"
  className={`${sizeClasses[size]} ${clickable ? "hover:bg-accent cursor-pointer" : ""}`}
  style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
>
  {tag.name}
</Badge>
```

**核心约定 `tag.color + "20"`**：`20` 是 8 位十六进制颜色的 alpha 通道，`0x20 = 32`，`32/255 ≈ 12.5%` 不透明度。即「标签原色的 12.5% 透明作底」。**文字色不被内联覆盖**，仍继承 `secondary-foreground`（浅色近黑 `oklch(0.205)`、暗色近白 `oklch(0.985)`），因此文字并非用标签原色，而是随主题的中性色——保证任意标签色下文字都可读。

举例（`config.ts` 内真实值）：

| 标签 | slug | `color` | 底色（+20，12.5%） | 行 |
|---|---|---|---|---|
| 肖像 portrait | `portrait` | `#FF6B6B` | `#FF6B6B20` | `config.ts:130` |
| 极简 minimalist | `minimalist` | `#4ECDC4` | `#4ECDC420` | `config.ts:131` |
| 未来 futuristic | `futuristic` | `#6C5CE7` | `#6C5CE720` | `config.ts:139` |
| 赛博朋克 cyberpunk | `cyberpunk` | `#FF006E` | `#FF006E20` | `config.ts:148` |
| 素描 sketch | `sketch` | `#023047` | `#02304720` | `config.ts:151` |
| 奢华 luxury | `luxury` | `#D4AF37` | `#D4AF3720` | `config.ts:245` |

规则要点与坑：
- **色板本身无浅/暗区分**——同一 12.5% 底在暗色下会更暗更含蓄，靠 secondary-foreground 文字保证对比度。新增标签只需给一个饱和度适中的 hex，不用为暗色单独配色。
- `slug` 相同名不必唯一，但 `color` 决定观感。若 `tag.color` 缺失，则 `backgroundColor: undefined`，回退到 `Badge secondary` 的纯 `bg-secondary`。
- 新标签在后台创建时默认色为 `appDefaults.tag.color = "#94a3b8"`（`config.ts:303`，slate-400 灰蓝），即未指定颜色的中性回退。
- `TagList` 溢出计数用的是 `Badge variant="outline"`（`tag-badge.tsx:69`），**不带彩底**，走 `text-foreground`（见 `badge.tsx:21`）。
- 尺寸档：`sm` = `text-xs px-2 py-0.5`，`md` = `text-sm px-3 py-1`（`tag-badge.tsx:9-12`）。

### 5. 分类主题

分类（`config.ts:42-123`，共 10 个：摄影/插画/3D/AI 艺术/海报/品牌/产品/概念/角色/风景）**不携带颜色字段**，仅有 `id/name/slug/description/order/enabled`。分类在 UI 中不做彩色主题化——被选中的分类名会渲染进 Hero 标题的品牌渐变文字里（`client-gallery.tsx:147`，`currentCategoryName`），走的是下一节的品牌渐变，而非每分类独立配色。**新增分类无需也不要配颜色。**

### 6. 品牌渐变（Hero / CTA / 登录）

品牌渐变是**唯一被允许写死色值**的区域，统一使用 Tailwind 内置 slate/cyan/white 色阶。分三类用途：

**(A) Hero 标题「文字渐变」** —— `bg-gradient-to-r ... bg-clip-text text-transparent`，浅色深→青、暗色白→青：

```
浅色: from-slate-900 via-slate-500 to-cyan-500
暗色: dark:from-white dark:via-slate-200 dark:to-cyan-100
```

出现处（三个页面 Hero 标题一致）：`client-gallery.tsx:146`、`src/app/top/page.tsx`、`src/app/search/page.tsx` 的 Hero 标题。色值：slate-900 `#0f172a`、slate-500 `#64748b`、cyan-500 `#06b6d4`；暗色 white `#ffffff`、slate-200 `#e2e8f0`、cyan-100 `#cffafe`。

**(B) CTA 按钮「填充渐变」** —— 浅色系冷白到青，文字强制 `text-slate-950`（`#020617`），常态 → hover 更亮：

```
常态:  from-slate-200 via-white to-cyan-100
hover: hover:from-white hover:via-slate-100 hover:to-cyan-50
文字:  text-slate-950   边框: border-0
阴影:  shadow-lg shadow-cyan-100/20
```

出现处：详情模态框「复制 Prompt」主按钮 `image-modal.tsx:468`（尺寸 `h-11 md:h-12`）、登录提交按钮 `login-modal.tsx:143`（`h-10`，含 `rounded-xl` 与 `hover:scale-[1.02] active:scale-[0.98]` 微交互）。色值：slate-200 `#e2e8f0`、white `#ffffff`、cyan-100 `#cffafe`、slate-100 `#f1f5f9`、cyan-50 `#ecfeff`。**坑：此按钮在深色浮层里，文字必须显式 `text-slate-950`——不能依赖继承，否则浮层 foreground 会让浅底上出现浅字。**

**(C) Logo 徽标 / 装饰渐变** —— `bg-gradient-to-br from-white via-slate-200 to-cyan-100`（左上→右下）：

| 用途 | 类名要点 | 来源 |
|---|---|---|
| 前台侧栏 Logo 方块 | `h-8 w-8 rounded-lg ...渐变 shadow-sm ring-1 ring-slate-300/70` | `sidebar.tsx:115` |
| 移动端侧栏 Logo | 同上 | `mobile-sidebar.tsx:124` |
| 后台侧栏 Logo | 同上 | `admin-sidebar.tsx:62` |
| 登录框顶部图标块 | `h-12 w-12 rounded-xl ...渐变 shadow-lg shadow-cyan-100/20`，内嵌 `Sparkles text-slate-900` | `login-modal.tsx:75-76` |
| 登录框整层微光 | `from-white/18 via-slate-200/8 to-cyan-100/14`（透明叠加，`pointer-events-none`） | `login-modal.tsx:71` |
| 登录框标题文字 | `bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70` | `login-modal.tsx:79` |

`ring-slate-300/70` = slate-300 `#cbd5e1` @70% 描边；`shadow-cyan-100/20` = cyan-100 @20% 的柔光阴影。登录框整体是暗玻璃拟态：`DialogContent` 用 `bg-black/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 dark:ring-white/5`（`login-modal.tsx:70`），内部文字走 `text-zinc-400`（标题/标签，`login-modal.tsx:82,91,109`）与 `text-zinc-500`（图标，`login-modal.tsx:95,113`），输入框 `placeholder:text-zinc-600`、聚焦色 `focus:border-cyan-100/60`（`login-modal.tsx:103,121`）——**这是全站唯一固定深色的浮层，不随主题切换。**

### 7. destructive / 红色：删除与退出

危险操作的红色分两条线，**务必区分**：

**(1) 语义 `destructive` token**（随主题、走设计系统）：
- 按钮 `variant="destructive"` = `bg-destructive text-white hover:bg-destructive/90`，暗色 `dark:bg-destructive/60`，焦点 `focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40`（`button.tsx:15-16`）；Badge 同理（`badge.tsx:18-19`）。
- **坑：destructive 按钮文字固定 `text-white`，而非 `--destructive-foreground`**——因为 `--destructive-foreground` 在浅色被设成了红色（`oklch(0.577 0.245 27.325)`，`globals.css:22`），若用它会红底红字。所以组件里用 `text-white` 硬写。自定义破坏性控件请照抄 `text-white`。
- 图标按钮式删除用透明度叠加：`text-muted-foreground hover:text-destructive hover:bg-destructive/10`（`admin-prompt-list.tsx:375`）。

**(2) 直接写 Tailwind `red-500` 系**（不走 token，用于退出登录与部分后台删除，视觉上比 destructive 更「亮红警示」）：
- **退出登录**：侧栏退出按钮文字统一 `text-red-500 hover:text-red-600 hover:bg-red-500/10`（`sidebar.tsx:249`、`admin-sidebar.tsx:129`；移动端见 `mobile-sidebar.tsx`）。确认弹窗（AlertDialog）的确认按钮统一 `bg-red-500 hover:bg-red-600 focus:ring-red-500`（`sidebar.tsx:285`、`mobile-sidebar.tsx:287`、`admin-sidebar.tsx:152`）。
- **删除类操作**：后台标签/分类删除图标 `text-red-500 hover:text-red-600 hover:bg-red-500/10`（`app/admin/(dashboard)/tags/page.tsx:305`、`app/admin/(dashboard)/categories/page.tsx:152`）；批量删除按钮 `outline` + `text-red-500 hover:text-red-600`（`admin-prompt-list.tsx:295`）；删除确认按钮 `bg-red-500 hover:bg-red-600 focus:ring-red-500`（`admin-prompt-list.tsx:405`）。
- **表单错误文案**：浅底页面用 `text-red-500`（`app/admin/login/page.tsx:96`）；深色登录浮层用 `text-red-400 bg-red-500/10 border-red-500/20`（`login-modal.tsx:134`），Turnstile 错误 `text-red-400`（`features/auth/components/turnstile-widget.tsx:186`）。

色值参考：red-400 `#f87171`、red-500 `#ef4444`、red-600 `#dc2626`。

**约定小结（红色用哪一个）**：破坏性「主按钮/Badge」走 `variant="destructive"`（记得 `text-white`）；退出登录与后台删除的**行内文字/hover 与确认弹窗按钮**沿用现有 `red-500/600` 直写风格以保持一致；错误提示文字浅底 `text-red-500`、深色浮层 `text-red-400`。**新增危险操作请对齐上述已有模式，勿再引入第三种红。**

---

<a id="sec-3"></a>

## 3. 字体与排版

本章规定 NanoGallery 所有文字的字体族、字号阶梯、字重、行高、字距、文本平衡、渐变文字、等宽代码与截断规则。除非另有说明，所有数值均基于 Tailwind CSS v4 默认刻度（`rem` 基准为 `1rem = 16px`），并与源码逐条对齐。

### 1. 字体族（系统字体栈，无 Google 字体）

字体在 `@theme inline` 中通过 CSS 变量定义，不引入任何外部 webfont（无 `next/font`、无 Google Fonts），首屏零字体网络请求。

| CSS 变量 | Tailwind 工具类 | 取值（原样） | 来源 |
| --- | --- | --- | --- |
| `--font-sans` | `font-sans` | `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif` | `src/app/globals.css:78` |
| `--font-mono` | `font-mono` | `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace` | `src/app/globals.css:79` |

约定与坑：
- `<body>` 全局挂 `font-sans antialiased`（`src/app/layout.tsx:47`）。`antialiased` 即 `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`，全站默认灰度抗锯齿。
- `<html lang="zh-CN">`（`src/app/layout.tsx:46`）——中文优先，字体栈里 `PingFang SC`（macOS/iOS 苹方）、`Hiragino Sans GB`、`Microsoft YaHei`（Windows 微软雅黑）是三大中文兜底，务必保持该顺序，不要在栈前插入西文字体导致中文被降级到 `Arial`。
- **必须**：任何需要等宽的场景（代码/Prompt 正文）只用 `font-mono`，不要手写 `font-family`；`SFMono-Regular` 是 Apple 系统等宽首选。

### 2. 字号阶梯（text-*）

全站使用的字号档位及其真实像素，以及在哪一层级/场景使用（`text-6xl` 未使用）：

| 类名 | rem | px | 默认 line-height | 典型用途 | 代表来源 |
| --- | --- | --- | --- | --- | --- |
| `text-xs` | 0.75rem | 12px | 1rem/16px | 徽标 pill、卡片图片降级标题、侧边栏分组标题（大写）、ID 文本、说明文字、登录 Label、Toast 描述 | `image-modal.tsx:378`、`image-card.tsx:44`、`image-modal.tsx:457` |
| `text-sm` | 0.875rem | 14px | 1.25rem/20px | 正文/说明主力档、按钮文案、区块小标题（Prompt/Tags）、加载提示、Toast 标题、表单 mono 输入、shadcn `Label` 基础组件 | `image-modal.tsx:401`、`client-gallery.tsx:152`、`client-gallery.tsx:231` |
| `text-base` | 1rem | 16px | 1.5rem/24px | Hero 副标题（移动档）、模态描述（桌面档）、Footer 主按钮桌面档 | `client-gallery.tsx:149`、`image-modal.tsx:370`、`image-modal.tsx:468` |
| `text-lg` | 1.125rem | 18px | 1.75rem/28px | Hero 副标题（`md:` 桌面档）、Dialog 默认标题（shadcn `DialogTitle`，`text-lg leading-none font-semibold`） | `client-gallery.tsx:149`、`src/shared/ui/dialog.tsx:113` |
| `text-xl` | 1.25rem | 20px | 1.75rem/28px | 二级标题"探索作品"、模态标题移动档 | `client-gallery.tsx:166`、`image-modal.tsx:351` |
| `text-2xl` | 1.5rem | 24px | 2rem/32px | 登录模态主标题"欢迎回来" | `login-modal.tsx:79` |
| `text-3xl` | 1.875rem | 30px | 2.25rem/36px | 首页 H1 移动档、Prompt 详情页 H1 移动档、模态标题桌面档（`md:text-3xl`） | `client-gallery.tsx:146`、`image-modal.tsx:351` |
| `text-4xl` | 2.25rem | 36px | 2.5rem/40px | 仅 Prompt 详情页 H1 桌面档（`text-3xl md:text-4xl`，全站唯一一处） | `src/app/prompt/[id]/page.tsx:69` |
| `text-5xl` | 3rem | 48px | 1（none） | 首页/搜索/排行 H1 桌面档（`md:text-5xl`） | `client-gallery.tsx:146`、`src/app/search/page.tsx:107`、`src/app/top/page.tsx:95` |

**响应式字号约定（必须遵守）**：标题一律"移动小、桌面大"的两档写法，断点用 `md:`（≥768px）。
- 首页/搜索/排行页 H1：`text-3xl md:text-5xl`（30px → 48px），`src/features/gallery/components/client-gallery.tsx:146`。
- Prompt 详情页 H1：`text-3xl md:text-4xl`（30px → 36px），`src/app/prompt/[id]/page.tsx:69`。
- 模态标题 `DialogTitle`：`text-xl md:text-3xl`（20px → 30px），`src/features/gallery/components/image-modal.tsx:351`。
- Hero 副标题：`text-base md:text-lg`（16px → 18px），`src/features/gallery/components/client-gallery.tsx:149`。
- 模态描述：`text-sm md:text-base`（14px → 16px），`src/features/gallery/components/image-modal.tsx:370`。
- Prompt 代码块：`text-xs md:text-sm`（12px → 14px），`src/features/gallery/components/image-modal.tsx:408`。
- Footer 主按钮：`text-sm md:text-base`（14px → 16px），`src/features/gallery/components/image-modal.tsx:468`。

### 3. 字重（font-*）

全站主要使用三档字重，正文继承默认 400（无 `font-light`/显式 `font-normal`）：

| 类名 | font-weight | 用途 | 代表来源 |
| --- | --- | --- | --- |
| `font-medium` | 500 | 徽标 pill 文本、表单 Label、登录 Label、搜索结果卡片标题、shadcn `Label` 基础组件 | `image-modal.tsx:378`、`login-modal.tsx:91`、`src/shared/ui/label.tsx:16` |
| `font-semibold` | 600 | 区块小标题（Prompt/Tags 大写标签）、侧边栏分组标题、Toast 标题、Footer 主按钮、shadcn `DialogTitle`/`CardTitle` | `image-modal.tsx:401`、`image-modal.tsx:468`、`src/shared/ui/dialog.tsx:113`、`src/shared/ui/card.tsx:37` |
| `font-bold` | 700 | 页面 H1、"探索作品" H2、模态标题、登录模态主标题 | `client-gallery.tsx:146`、`client-gallery.tsx:166`、`image-modal.tsx:351`、`login-modal.tsx:79` |

约定：标题（H1/H2/模态标题）用 `font-bold`；分区小标题、shadcn 卡片/对话框标题与强调按钮用 `font-semibold`；辅助元信息、Label 用 `font-medium`。

### 4. 行高（leading-*）与字距（tracking-*）

行高档位（覆盖默认 line-height）：

| 类名 | line-height | 用途 | 来源 |
| --- | --- | --- | --- |
| `leading-tight` | 1.25 | 模态大标题，紧凑防止多行标题过散 | `image-modal.tsx:351` |
| `leading-snug` | 1.375 | 搜索结果卡片标题 | `src/features/search/components/search-result-card.tsx:34` |
| `leading-relaxed` | 1.625 | 正文/描述/Prompt 代码正文/锁定提示，提高长文可读性 | `image-modal.tsx:370`、`image-modal.tsx:408`、`image-modal.tsx:416` |
| `leading-none` | 1 | shadcn `DialogTitle`、`CardTitle`、`Label` 基础组件 | `src/shared/ui/dialog.tsx:113`、`src/shared/ui/card.tsx:37`、`src/shared/ui/label.tsx:16` |

字距档位（覆盖默认 letter-spacing）：

| 类名 | letter-spacing | 用途 | 来源 |
| --- | --- | --- | --- |
| `tracking-tight` | -0.025em | 大标题收紧（模态标题、登录标题） | `image-modal.tsx:351`、`login-modal.tsx:79` |
| `tracking-wide` | 0.025em | 侧边栏/管理侧栏大写分组标题（`text-xs font-semibold uppercase`） | `src/features/shell/components/sidebar.tsx:140` |
| `tracking-wider` | 0.05em | 模态内 `uppercase` 小标题（PROMPT / TAGS） | `image-modal.tsx:401`、`image-modal.tsx:448` |
| `tracking-normal` | 0em | Toast 标题（显式归零，`text-sm font-semibold tracking-normal`） | `src/shared/ui/sonner.tsx:17` |

**大写标签约定（必须遵守）**：模态内的分区标题（`Prompt`、`Tags`）统一 `text-sm font-semibold text-muted-foreground uppercase tracking-wider`（`src/features/gallery/components/image-modal.tsx:401`、`:448`）。凡新增此类分区标题，务必带 `uppercase tracking-wider`，否则视觉不齐——大写字母配正字距是本项目的固定风格。注意侧边栏分组标题用的是较小的 `tracking-wide`（0.025em），二者不要混用。

### 5. 文本平衡（text-balance / text-pretty）

| 类名 | CSS | 用途 | 来源 |
| --- | --- | --- | --- |
| `text-balance` | `text-wrap: balance` | 页面 H1 标题，避免末行孤字、各行宽度均衡 | `client-gallery.tsx:146`、`src/app/search/page.tsx:107` |
| `text-pretty` | `text-wrap: pretty` | Hero 副标题段落，优化多行断行 | `client-gallery.tsx:149`、`src/app/top/page.tsx:98` |

约定：**标题用 `text-balance`，段落用 `text-pretty`**；副标题段落通常配 `max-w-2xl mx-auto`（`client-gallery.tsx:149`）限制行宽以配合断行优化。

### 6. 渐变文字标题（bg-clip-text + text-transparent）

这是本项目品牌标题的核心视觉，务必按原类使用。

首页 / 搜索页 / 排行页 H1（明暗双套渐变），完整类：
```
text-3xl md:text-5xl font-bold mb-4 text-balance
bg-gradient-to-r from-slate-900 via-slate-500 to-cyan-500
bg-clip-text text-transparent
dark:from-white dark:via-slate-200 dark:to-cyan-100
```
来源 `src/features/gallery/components/client-gallery.tsx:146`（另见 `src/app/search/page.tsx:107`、`src/app/top/page.tsx:95`）。

- 渐变方向 `bg-gradient-to-r`（向右，90deg）。
- 亮色三段：`from-slate-900`（oklch(0.208 0.042 265.755) ≈ `#0f172a`）→ `via-slate-500`（oklch(0.554 0.046 257.417) ≈ `#64748b`）→ `to-cyan-500`（oklch(0.715 0.143 215.221) ≈ `#06b6d4`）。
- 暗色三段：`dark:from-white`（`#ffffff`）→ `dark:via-slate-200`（oklch(0.929 0.013 255.508) ≈ `#e2e8f0`）→ `dark:to-cyan-100`（oklch(0.917 0.08 205.041) ≈ `#cffafe`）。

登录模态主标题（另一套渐变，仅用于深色玻璃浮层）：
```
text-2xl font-bold tracking-tight
bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70
```
来源 `src/features/auth/components/login-modal.tsx:79`。方向 `to-br`（右下 135deg），白→70% 白，不随主题切换（浮层背景恒为深色玻璃）。

**渐变文字铁律（必须遵守）**：
- 三件套缺一不可：`bg-gradient-to-*` + `bg-clip-text` + `text-transparent`。少了 `text-transparent` 文字会盖住渐变；少了 `bg-clip-text` 渐变会填满整个盒子。
- 渐变文字**不能**再叠加 `text-foreground` 之类的实色 `color`，否则透明失效。
- 浮层内继承坑：登录模态整体在 `bg-black/20 backdrop-blur-xl`（`login-modal.tsx:70`）深色玻璃上，标题渐变写死白色系、副标题/Label 用 `text-zinc-400`（`login-modal.tsx:82`、`:91`）。**在这类深色浮层里新增文字必须显式指定浅色**（如 `text-white` / `text-zinc-400`），不要依赖 `text-foreground` 继承——浮层背景与页面主题不一致，继承色会在浅色主题下变黑而不可读。同理浮层内主按钮文字写死 `text-slate-950`（`login-modal.tsx:143`、`image-modal.tsx:468`），因为按钮底是浅色渐变（`from-slate-200 via-white to-cyan-100`），务必配深色文字。

### 7. 等宽字体与 Prompt 代码块

Prompt 正文按"代码块"呈现，是 `font-mono` 的唯一前台使用场景。完整容器类（`src/features/gallery/components/image-modal.tsx:408`）：
```
h-full max-h-full bg-muted rounded-lg p-4 md:p-5
font-mono text-xs md:text-sm leading-relaxed text-foreground
shadow-inner border border-border overflow-x-auto overflow-y-auto
[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border/40
[&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/60
```
排版要点：
- 字体 `font-mono`（等宽），字号 `text-xs md:text-sm`（12px → 14px），行高 `leading-relaxed`（1.625），颜色 `text-foreground`。
- 圆角 `rounded-lg`（= `var(--radius-lg)` = `var(--radius)` = 0.625rem = 10px，`src/app/globals.css:31`、`:106`），内边距 `p-4 md:p-5`（16px → 20px），底色 `bg-muted`，`1px` 边框 `border-border`，内阴影 `shadow-inner`。
- 正文段落 `whitespace-pre-wrap break-words`（`image-modal.tsx:426`）——保留换行/空格且长串强制断行，Prompt 里的换行与缩进原样呈现。
- 自定义细滚动条：`[&::-webkit-scrollbar]:w-2`（宽 8px），thumb `bg-border/40` 圆角，hover `bg-border/60`。

后台表单的 Prompt 输入同样 `font-mono text-sm`（`src/features/admin/components/prompt-form.tsx:397`，配 `min-h-[120px]`），保持前后台等宽一致。

**约定**：任何展示 Prompt/代码原文的地方一律 `font-mono`；正文渲染务必配 `whitespace-pre-wrap break-words`，否则丢失换行或撑破容器。

### 8. 文本截断（line-clamp-* / truncate）

| 类名 | 效果 | 用途 | 来源 |
| --- | --- | --- | --- |
| `line-clamp-2` | 最多 2 行，溢出省略号 | 卡片图片降级标题、模态描述、搜索结果描述 | `src/features/gallery/components/image-card.tsx:44`、`image-modal.tsx:370`、`src/features/search/components/search-result-card.tsx:36` |
| `line-clamp-1` | 最多 1 行省略 | shadcn Select 选中值（`*:data-[slot=select-value]:line-clamp-1`） | `src/shared/ui/select.tsx:40` |

约定：卡片/模态描述固定用 `line-clamp-2` 保证瀑布流卡片高度节律一致；模态描述 `line-clamp-2` 与图片区网格高度配合（`image-modal.tsx:370`）。宽度受限的单行元信息用 `truncate`/`line-clamp-1`。

### 9. 数值速查（本章涉及的换算基准）

| 项 | 值 |
| --- | --- |
| 根字号 | 1rem = 16px |
| `--radius` | 0.625rem = 10px（代码块 `rounded-lg`/`--radius-lg` 即此值） |
| 边框线宽 | `border` = 1px |
| 断点 `md:` | ≥768px（本项目所有字号双档切换点） |
| `text-balance` | `text-wrap: balance`（标题用） |
| `text-pretty` | `text-wrap: pretty`（段落用） |
| `tracking-tight` / `wide` / `wider` | -0.025em / 0.025em / 0.05em |

---

<a id="sec-4"></a>

## 4. 间距、布局与断点

本章描述 NanoGallery 前台页面的整体骨架尺寸、响应式断点、容器最大宽度、页面内边距与常用间距原语。所有数值均直接取自源码，任何新页面/组件的布局都必须复用本章约定，不要凭感觉另起一套间距体系。

### 断点体系（Tailwind v4 默认，未自定义）

项目未提供 `tailwind.config.*`（`ls tailwind.config*` 无匹配），也未在 `src/app/globals.css` 中用 `@theme` 覆盖断点（该文件仅有 `@theme inline` 声明颜色令牌，globals.css:77），因此沿用 Tailwind v4 默认断点。前台实际用到的断点集中在 `md`、`lg`、`xl` 三档：

| 前缀 | min-width | px | 本项目主要用途 |
| --- | --- | --- | --- |
| `sm` | 40rem | 640px | 仅 `.masonry-grid` / `.masonry-item` 的 CSS 媒体查询用到（列间距 0.5rem→0.75rem、item 下边距 0.5rem→0.75rem），Tailwind 类里前台几乎不用 |
| `md` | 48rem | 768px | 标题字号、区块纵向 padding 的放大档（`md:text-5xl`、`md:py-12`、`md:text-4xl`） |
| `lg` | 64rem | 1024px | 侧边栏显隐与主区偏移的总开关；详情页两列布局；JS 瀑布流 3 列档 |
| `xl` | 80rem | 1280px | 画廊 JS 瀑布流从 3 列升到 4 列 |
| `2xl` | 96rem | 1536px | 前台未显式使用；仅作为 `container` 的最后一档 max-width 生效 |

关键约定：`lg`（1024px）是本项目的"桌面/移动"分界线。侧边栏、移动顶栏、主区偏移全部以 `lg` 为断点，不要用 `md` 或其它断点去切换布局骨架，否则会与侧边栏错位。

### 页面骨架尺寸示意

整个前台由 `LayoutWrapper`（`src/features/shell/components/layout-wrapper.tsx`）搭出三块：桌面侧边栏、移动顶栏、主内容定位层。桌面侧边栏被 `hidden lg:block` 包裹（layout-wrapper.tsx:27），仅 ≥1024px 显示。

```
桌面 (≥1024px, lg)                         移动 (<1024px)
┌──────────┬───────────────────────────┐   ┌───────────────────────────┐
│ Sidebar  │  main content             │   │ MobileHeader  h-16 (64px) │ fixed top
│ fixed    │  <div class="lg:ml-64">   │   ├───────────────────────────┤
│ w-64     │   ← 左边距 16rem/256px      │   │ main content              │
│ =16rem   │                           │   │ <div class="pt-16">       │
│ =256px   │  min-h-screen             │   │  ← 顶部留白 4rem/64px       │
│ h-screen │  pt-0 (lg)                │   │  min-h-screen             │
│ z-40     │                           │   │                           │
└──────────┴───────────────────────────┘   └───────────────────────────┘
```

主内容定位层：`lg:ml-64 min-h-screen pt-16 lg:pt-0`（layout-wrapper.tsx:38）。

- `lg:ml-64` = `margin-left: 16rem = 256px`，仅 ≥1024px 生效，正好等于侧边栏宽度，避免内容被固定侧边栏遮挡。
- `pt-16` = `padding-top: 4rem = 64px`，为移动端固定顶栏预留高度；`lg:pt-0` 在桌面端归零。
- `min-h-screen` = `min-height: 100vh`。

`isAdmin`（路径以 `/admin` 开头）时 `LayoutWrapper` 直接返回 `children`，不套侧边栏/顶栏（layout-wrapper.tsx:20-22）。此定位层只是"定位壳"，本身不含 `<main>` landmark，各页面自行渲染自己的 `<main>`（layout-wrapper.tsx:37 注释也明确了这一点）。

### 桌面侧边栏（Sidebar）尺寸

来源 `src/features/shell/components/sidebar.tsx`。

| 部件 | 类名 | 计算值 | 来源 |
| --- | --- | --- | --- |
| 外层 `<aside>` | `fixed left-0 top-0 z-40 h-screen w-64` | 宽 16rem/256px，高 100vh，层级 40 | sidebar.tsx:105 |
| 右边框 | `border-r border-border/40` | 1px，边框色 40% 不透明度 | sidebar.tsx:105 |
| Logo 区高度 | `flex h-16 items-center px-6` | 高 4rem/64px，左右 padding 1.5rem/24px | sidebar.tsx:108 |
| Logo 图标块 | `h-8 w-8 rounded-lg`，内含 `Sparkles h-5 w-5` | 32×32px，圆角 0.5rem/8px，图标 20×20px | sidebar.tsx:115-116 |
| 搜索按钮区 | `px-4 py-4` | 左右/上下 padding 均 1rem/16px | sidebar.tsx:125 |
| 滚动区 | `ScrollArea flex-1 px-4` | 占满剩余高度，左右 padding 1rem/16px | sidebar.tsx:137 |
| 导航项间距 | `space-y-1 py-2` | 子项纵向间隙 0.25rem/4px，上下 padding 0.5rem/8px | sidebar.tsx:139 |
| 分隔线外边距 | `my-4` | 上下 1rem/16px | sidebar.tsx:169 |
| 底部操作区 | `border-t border-sidebar-border p-4 space-y-2` | padding 1rem/16px，子项纵向间隙 0.5rem/8px；顶边框 1px 用 `sidebar-border` 令牌 | sidebar.tsx:217 |

侧边栏 `z-40`，其内的固定移动顶栏 `z-50`（layout-wrapper.tsx:32），层级不要混用。侧边栏 Suspense fallback 是一块与 `<aside>` 同尺寸同定位的占位块 `fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar`（sidebar.tsx:298），保证首屏不跳动。

### 移动顶栏（MobileHeader）与抽屉

- 固定顶栏容器：`fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden`（layout-wrapper.tsx:32）。高 `h-16`=4rem/64px，左右 `px-4`=1rem/16px，`lg:hidden` 在 ≥1024px 隐藏。
- 抽屉侧栏 `SheetContent side="left" className="w-64 p-0"`（`src/features/shell/components/mobile-sidebar.tsx:113`），宽度与桌面侧边栏一致 16rem/256px，内部结构（`h-16` Logo 区 mobile-sidebar.tsx:117、`px-4 py-4` 搜索 mobile-sidebar.tsx:134、`px-4` 滚动区 mobile-sidebar.tsx:146、`border-t p-4 space-y-2` 底部 mobile-sidebar.tsx:230）与桌面端逐一对齐，改动一侧务必同步另一侧。注意：底部操作区的 padding/间距一致（`p-4 space-y-2`），但桌面端顶边框用 `border-sidebar-border`、移动端仅用默认 `border-t`。
- 触发按钮 `Button variant="ghost" size="icon"`，内含 `Menu h-5 w-5`（20×20px，mobile-sidebar.tsx:109-110）。

### 容器最大宽度（三种并存，勿混用）

前台三类页面用了三套不同的宽度约束，是本项目的关键约定：

| 页面 | 容器类 | 最大宽度 | 内边距 | 来源 |
| --- | --- | --- | --- | --- |
| 首页画廊 | `w-full max-w-[2400px] mx-auto` | 2400px（超宽，给瀑布流更多列宽） | `px-3 py-6` | client-gallery.tsx:143 |
| 搜索页 | `container mx-auto` | Tailwind 默认逐档：sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536px | `px-4 py-8` | search/page.tsx:104 |
| 详情页 | `container mx-auto` | 同上，封顶 1536px | `px-4 py-8` | prompt/[id]/page.tsx:46 |
| 页脚 | `container mx-auto` | 同上 | `px-4` | client-gallery.tsx:257、search/page.tsx:172、prompt/[id]/page.tsx:158 |

规则：

- 沉浸式、瀑布流为主的浏览页用 `max-w-[2400px]` + `px-3`（更小的左右留白换取更宽画布）。
- 内容/表单/结果类页面用 `container mx-auto` + `px-4`（`container` 在 Tailwind v4 中即"每个断点等于该断点 min-width 的固定 max-width"，最终封顶 1536px）。
- 搜索区/文本区再套一层 `max-w-3xl mx-auto` 收窄阅读宽度（=48rem/768px，search/page.tsx:106）；Hero 描述段用 `max-w-2xl mx-auto`（=42rem/672px，client-gallery.tsx:149），详情页锁定内容提示文案用 `max-w-sm`（=24rem/384px，prompt/[id]/page.tsx:102）。

### 页面级内边距 / 区块纵向节奏

| 场景 | 类名 | 计算值 | 来源 |
| --- | --- | --- | --- |
| 首页 main | `px-3 py-6` | 左右 0.75rem/12px，上下 1.5rem/24px | client-gallery.tsx:143 |
| 搜索/详情 main | `px-4 py-8` | 左右 1rem/16px，上下 2rem/32px | search/page.tsx:104、prompt/[id]/page.tsx:46 |
| Hero 区 | `py-8 md:py-12` | 上下 2rem/32px，≥768px 升 3rem/48px | client-gallery.tsx:145 |
| 搜索输入区 | `py-8 md:py-12` | 同上 | search/page.tsx:106 |
| 空状态提示 | `py-20` | 上下 5rem/80px | client-gallery.tsx:237、search/page.tsx:153/157 |
| 无关键词占位 | `py-12` | 上下 3rem/48px | search/page.tsx:164 |
| 页脚 | `mt-20 py-12` | 上外边距 5rem/80px，上下 padding 3rem/48px | client-gallery.tsx:256、search/page.tsx:171、prompt/[id]/page.tsx:157 |
| 加载哨兵 | `h-20 ... mt-8` | 高 5rem/80px，上外边距 2rem/32px | client-gallery.tsx:213 |

页脚在搜索页/详情页带 `border-t border-border/40`（1px、40% 不透明度，search/page.tsx:171、prompt/[id]/page.tsx:157），首页页脚（client-gallery.tsx:256）不带上边框，注意区分。

### 常用间距原语（gap / space / margin）

| 用途 | 类名 | 计算值 | 来源 |
| --- | --- | --- | --- |
| 图标与文字（`mr-2`） | `mr-2` | 0.5rem/8px | sidebar.tsx:131 等 |
| 首页排序按钮组 | `flex items-center gap-2 flex-wrap` | 元素间隙 0.5rem/8px，可换行 | client-gallery.tsx:167 |
| 搜索页排序按钮组 | `flex items-center gap-2` | 元素间隙 0.5rem/8px，**不换行**（无 `flex-wrap`） | search/page.tsx:121 |
| 标题行与按钮组换行间距 | `flex items-center justify-between ... flex-wrap gap-4` | 换行/元素间隙 1rem/16px | client-gallery.tsx:165、search/page.tsx:117 |
| Hero 统计胶囊组 | `flex items-center justify-center gap-2` | 0.5rem/8px | client-gallery.tsx:152 |
| 统计胶囊内边距 | `px-3 py-1 rounded-full` | 左右 0.75rem/12px、上下 0.25rem/4px、全圆角 | client-gallery.tsx:153/156 |
| 详情页两列栅格 | `grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16` | 移动单列/≥1024px 两列，间隙 2rem/32px→3rem/48px，下外边距 4rem/64px | prompt/[id]/page.tsx:54 |
| 详情右列纵向节奏 | `space-y-6` | 子项间隙 1.5rem/24px | prompt/[id]/page.tsx:67 |
| Prompt 内容卡 | `bg-muted/50 rounded-lg p-6 space-y-4` | 圆角 0.5rem/8px、padding 1.5rem/24px、子项间隙 1rem/16px | prompt/[id]/page.tsx:85 |
| 锁定内容占位 | `flex min-h-[160px] flex-col ... gap-3` | 最小高 10rem/160px，子项间隙 0.75rem/12px | prompt/[id]/page.tsx:98 |
| 元数据栅格 | `grid grid-cols-2 gap-4`，卡片 `bg-muted/30 rounded-lg p-4` | 两列、间隙 1rem/16px、卡内 padding 1rem/16px | prompt/[id]/page.tsx:111-113 |
| 返回链接下边距 | `mb-8` | 2rem/32px | prompt/[id]/page.tsx:48 |
| 区块标题下边距 | `mb-4` / `mb-6` | 1rem/16px、1.5rem/24px | client-gallery.tsx:146/164、search/page.tsx:117 |
| PopularTags 上边距 | `mt-5` | 1.25rem/20px | client-gallery.tsx:160、search/page.tsx:111 |

`space-y-*` 与 `gap-*` 分工：Flex/Grid 容器内元素间距用 `gap-*`（详情两列、排序按钮组、瀑布流列），普通块级堆叠用 `space-y-*`（侧边栏导航、详情右列、内容卡）。二者不要在同一容器混用。

坑：搜索页排序按钮组（search/page.tsx:121）与首页排序按钮组（client-gallery.tsx:167）看似一致，但首页带 `flex-wrap`、搜索页不带。新增排序/筛选按钮组时若元素较多可能溢出，请显式补 `flex-wrap` 保持与首页一致的换行行为。

### 画廊瀑布流（两种实现，列间距均为 gap-2 / 0.5rem 起）

项目有两套瀑布流，间距不同，需分清：

1. 首页 JS 分列瀑布流（client-gallery.tsx:196-208）：外层 `flex gap-2 items-start`，每列 `flex flex-col gap-2 flex-1 min-w-0`。列间距与列内卡片间距均为 `gap-2` = 0.5rem/8px，且不随断点变化。列数由 JS 按 `window.innerWidth` 计算（client-gallery.tsx:123-133）：

   | 视口宽度 | 列数 |
   | --- | --- |
   | `≥1280px`（xl） | 4 |
   | `≥1024px`（lg） | 3 |
   | `<1024px` | 2 |

   注意此处 JS 阈值（1280/1024）与 CSS `.masonry-grid` 的媒体查询阈值一致，但断点起点不同——JS 版最小列数是 2 且无 640 档变化。分页 `pageSize = 12`（client-gallery.tsx:34），累积加载。

2. CSS 列式瀑布流 `.masonry-grid`（搜索结果、详情相关推荐用，`src/app/globals.css:130-155`），基于 `column-count` + `column-gap`：

   | 媒体查询 | column-count | column-gap |
   | --- | --- | --- |
   | 默认（`<640px`） | 2 | 0.5rem/8px |
   | `≥640px`（sm） | 2 | 0.75rem/12px |
   | `≥1024px`（lg） | 3 | 0.75rem/12px |
   | `≥1280px`（xl） | 4 | 0.75rem/12px |

   子项 `.masonry-item`：`break-inside: avoid`、`margin-bottom: 0.5rem`（≥640px 升 `0.75rem`）、`display: inline-block; width: 100%; vertical-align: top`（globals.css:157-169）。

   使用位置：`<div className="masonry-grid">`（search/page.tsx:147、prompt/[id]/page.tsx:147）。

规则：面向"网格/瀑布流"新增布局时，若走服务端渲染的静态列表优先用 `.masonry-grid`（纯 CSS、SSR 友好）；需要按加载状态动态重排、依赖 JS 列分配的场景才用首页那套 `flex + JS columns`。两者列间距基线都是 0.5rem 起、桌面 0.75rem，保持视觉一致。

---

<a id="sec-5"></a>

## 5. 圆角 · 描边 · 分割线 · 阴影 · 模糊

本章是全站「线条」系统的权威参照：所有圆角、边框线宽、分割线、焦点环（ring）、阴影阶梯与背景模糊都以此为准。数值全部来自源码实测，Tailwind v4 默认换算基准为 `1rem = 16px`、`0.25rem = 4px`。

### 一、圆角（Border Radius）

#### 1.1 根变量与派生刻度

圆角的唯一真源是 `--radius`，其余尺度由它 `calc()` 派生（`src/app/globals.css:31`、`104-107`）：

```css
--radius: 0.625rem;                     /* = 10px */
--radius-sm: calc(var(--radius) - 4px); /* = 6px  */
--radius-md: calc(var(--radius) - 2px); /* = 8px  */
--radius-lg: var(--radius);             /* = 10px */
--radius-xl: calc(var(--radius) + 4px); /* = 14px */
```

| 类名 | CSS 变量 / 值 | 计算值 | 来源 |
|---|---|---|---|
| `rounded-xs` | `0.125rem`（Tailwind 默认） | 2px | `dialog.tsx:72`、`sheet.tsx:75` 关闭按钮 |
| `rounded-sm` | `var(--radius-sm)` | 6px | 派生自 `globals.css:104` |
| `rounded-md` | `var(--radius-md)` | 8px | `button.tsx:10,27,28` |
| `rounded-lg` | `var(--radius-lg)` = `--radius` | 10px | `image-card.tsx:31`、`image-modal.tsx:408` |
| `rounded-xl` | `var(--radius-xl)` | 14px | `card.tsx:12`、`dialog.tsx:63`、`alert-dialog.tsx:57`、`image-modal.tsx:267` |
| `rounded-2xl` | `1rem`（Tailwind 默认） | 16px | （当前未使用） |
| `rounded-full` | `9999px` | 全圆/胶囊 | 见 §1.3 |

> 约定：改站点整体圆角风格只需调 `--radius` 一处，`sm/md/lg/xl` 会同步平移；不要在组件里散写 `rounded-[10px]` 之类硬编码值绕过该系统。`rounded-xs` 和 `rounded-2xl` 走的是 Tailwind 内置刻度，不随 `--radius` 变化，改它们不会影响弹窗关闭按钮（登录图标块已改用 rounded-xl）。

#### 1.2 各组件圆角归属速查

| 组件 | 圆角类 | 值 | 来源 |
|---|---|---|---|
| Button（全尺寸） | `rounded-md` | 8px | `button.tsx:10`（base）、`sm`/`lg` 再次显式声明 `rounded-md`（`button.tsx:27,28`） |
| Card | `rounded-xl` | 14px | `card.tsx:12` |
| ImageCard（Card 覆写） | `rounded-lg` | 10px | `image-card.tsx:31` |
| DialogContent / AlertDialogContent | `rounded-xl` | 14px | `dialog.tsx:63`、`alert-dialog.tsx:57` |
| ImageModal 弹窗容器 | `rounded-xl` | 14px | `image-modal.tsx:267` |
| Dialog 关闭按钮 | `rounded-xs` | 2px | `dialog.tsx:72` |
| Prompt 代码框 | `rounded-lg` | 10px | `image-modal.tsx:408` |

#### 1.3 `rounded-full`（9999px）用途

全站使用 `rounded-full` 共 31 处（`grep -ro rounded-full src` 计数），集中在圆形/胶囊元素：

| 场景 | 来源 |
|---|---|
| 滚动条 thumb | `globals.css:187`（`bg-border/50 rounded-full hover:bg-border`） |
| 卡片右上角浏览量胶囊 | `image-card.tsx:72` |
| 加载态旋转圈（`border-2 border-primary border-t-transparent`） | `client-gallery.tsx:230` |
| ImageModal 上/下一张、桌面关闭、移动关闭浮动按钮 | `image-modal.tsx:304,313,323,332` |
| Metadata Pills（比例/模型/风格胶囊 + 内部彩点） | `image-modal.tsx:378,379,384,385,390,391` |
| 点赞/分享 icon 按钮（`variant=ghost size=icon` + `rounded-full`） | `image-modal.tsx:358,364` |
| Prompt 代码框滚动条 thumb / 锁定态圆形图标底 | `image-modal.tsx:408,413` |

### 二、边框线宽与颜色（Border）

#### 2.1 线宽刻度

| 类名 | 线宽 | 典型用途 | 来源 |
|---|---|---|---|
| `border`（= `border-width:1px`） | 1px | 绝大多数描边：Button outline、Card、Dialog、Pills | `button.tsx:18`、`card.tsx:12`、`dialog.tsx:63` |
| `border-t` / `border-b` / `border-l` / `border-r` | 单边 1px | 分区分隔（右面板、页脚、页面 footer、侧栏） | `image-modal.tsx:340,455,465`、`top/page.tsx:147` |
| `border-2` | 2px | 旋转加载圈（配 `border-t-transparent`）、图片上传拖拽框虚线（配 `border-dashed`） | `client-gallery.tsx:230`、`prompt-form.tsx:212` |
| `border-0` / `border-none` | 0 | 渐变主按钮去边、登录弹窗容器去边 | `image-modal.tsx:468`、`login-modal.tsx:70,143` |

> 说明：全局 `@layer base { * { @apply border-border ... } }`（`globals.css:118-121`）已把所有元素默认边框色设为 `--border`，因此写 `border` / `border-t` 时无需再写颜色即为 `--border` 色。只有需要偏离该默认时才显式加颜色类。另外 `card.tsx:80`（CardFooter）用 `[.border-t]:pt-6` 做「加了上边线才补 padding」的条件钩子——它本身不画线，边线要由调用方追加 `border-t`。

#### 2.2 边框颜色与透明度

基准色（`globals.css`）：

| 变量 | 亮色值 | 近似 hex | 暗色值 | 近似 hex |
|---|---|---|---|---|
| `--border` / `--color-border` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#404040` |
| `--input` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#404040` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#404040` |

常用带透明度/带色描边（透明度即 oklch alpha，`/40` = 40% 不透明度）：

| 类名 | 含义 | 典型用途 | 来源 |
|---|---|---|---|
| `border-border` | 100% 边框色 | 代码框、锁定图标框 | `image-modal.tsx:408,413` |
| `border-border/50` | 50% 边框色 | ImageCard 外框、Metadata Pills、Stats 分隔线 | `image-card.tsx:31`、`image-modal.tsx:378,384,390,455` |
| `border-border/40` | 40% 边框色 | 页面 footer 上边线、移动顶栏下边线、侧栏右边线（全站 7 处） | `top/page.tsx:147`、`sidebar.tsx:105,298`、`admin-sidebar.tsx:58` 等 |
| `border-border/60` | 60% 边框色 | 标签输入建议框（单处） | `simple-tag-input.tsx:77` |
| `border-input` | 输入框边框色（= border 色） | Button outline 暗色态 `dark:border-input` | `button.tsx:18` |
| `border-white/10` | 白色 10% | 玻璃拟态弹窗描边（暗底/暗色态） | `dialog.tsx:63`、`alert-dialog.tsx:57`、`image-modal.tsx:267,340,465` |
| `border-white/30` | 白色 30% | ImageModal 亮色态外框/右面板/页脚 | `image-modal.tsx:267,340,465` |
| `border-white/12` | 白色 12% | Toast 暗色边（sonner） | `sonner.tsx:16,23` |
| `border-white/35` `border-white/40` | 白色 35% / 40% | Toast 亮色边 / Toast 关闭按钮边 | `sonner.tsx:16,25` |
| `border-transparent` | 透明占位（保留 1px 布局） | Tabs/Badge/Switch 状态切换避免抖动（全站 5 处） | `tabs.tsx:45`、`badge.tsx:15,17,19`、`switch.tsx:16` |
| `border-accent/50` | accent 色 50%（hover） | ImageCard hover 边框 | `image-card.tsx:31` |
| `border-primary/50` | primary 50%（hover） | 上传框 hover 边 | `prompt-form.tsx:212` |
| `aria-invalid:border-destructive` | 错误态红边 | 表单校验失败 | `button.tsx:10` |

> 玻璃浮层描边坑：ImageModal 用「亮色 `border-white/30` + 暗色 `dark:border-white/10`」双写（`image-modal.tsx:267,340,465`），而 shadcn 原生 `DialogContent` 仅写死 `border-white/10`（`dialog.tsx:63`）。在半透明玻璃面板上做边框时必须成对给亮/暗两个白色透明度，单写 `border-white/10` 在亮色背景下几乎不可见。

### 三、分割线（Separator）

`Separator` 组件（`separator.tsx:20`）用背景色块而非 border 实现，方向决定其取 1px 的边：

```
bg-border shrink-0
data-[orientation=horizontal]:h-px  data-[orientation=horizontal]:w-full   /* 横线：高 1px、宽满 */
data-[orientation=vertical]:h-full  data-[orientation=vertical]:w-px        /* 竖线：高满、宽 1px */
```

| 属性 | 值 | 说明 |
|---|---|---|
| 颜色 | `bg-border` = `--border` | 亮 `#e5e5e5` / 暗 `#404040` |
| 横向厚度 `h-px` | 1px | `orientation=horizontal`（默认） |
| 纵向厚度 `w-px` | 1px | `orientation=vertical` |
| `decorative` | 默认 `true`（`separator.tsx:11`） | 纯装饰，不进无障碍语义树 |

除组件外，页面内也大量直接用 `border-t` / `border-b` 当分割线（如 `image-modal.tsx:455` Stats 上分隔用 `pt-4 border-t border-border/50`），二者厚度都是 1px，颜色策略见 §2.2。

### 四、焦点环 / 描边环（Ring）

#### 4.1 Ring 线宽刻度

| 类名 | 线宽 | 用途 | 来源 |
|---|---|---|---|
| `ring-1` | 1px | 玻璃弹窗内描边高光 | `dialog.tsx:63`、`alert-dialog.tsx:57` |
| `ring-2` | 2px | 关闭按钮 `focus:ring-2` | `dialog.tsx:72`、`sheet.tsx:75` |
| `focus-visible:ring-[3px]` | 3px | Button 键盘焦点环（全站统一） | `button.tsx:10` |
| `ring-0` | 0 | Switch 滑块显式去环 | `switch.tsx:24` |

#### 4.2 Ring 颜色与偏移

| 类名 | 含义 | 来源 |
|---|---|---|
| `focus-visible:ring-ring/50` | 焦点环取 `--ring` 色 50%；`--ring` 亮 `oklch(0.708 0 0)`≈`#b5b5b5`，暗 `oklch(0.439 0 0)`≈`#6b6b6b` | `button.tsx:10` |
| `focus-visible:border-ring` | 焦点时边框转为 `--ring` 色 | `button.tsx:10` |
| `ring-white/10` `dark:ring-white/5` | 玻璃弹窗高光环：亮态白 10%、暗态白 5% | `dialog.tsx:63`、`alert-dialog.tsx:57` |
| `aria-invalid:ring-destructive/20` `dark:...ring-destructive/40` | 错误态红环，亮 20% / 暗 40% | `button.tsx:10` |
| `focus-visible:ring-destructive/20` `dark:...destructive/40` | destructive 按钮焦点红环 | `button.tsx:16` |
| `ring-offset-background` + `focus:ring-offset-2` | 环与元素间留 2px 背景色间隙 | `dialog.tsx:72`、`sheet.tsx:75` |

> 全局兜底：`globals.css:120` 的 `* { @apply ... outline-ring/50 }` 给所有元素默认 `outline` 色为 `--ring` 50%，是最后一道可见焦点保障；组件层的 `focus-visible:ring-[3px]` 才是主视觉焦点样式，二者不要相互覆盖删除。

### 五、阴影阶梯（Shadow）

#### 5.1 中性阴影（Tailwind 默认刻度）

| 类名 | 语义强度 | 典型用途 | 来源 |
|---|---|---|---|
| `shadow-xs` | 最弱（`0 1px 2px` 级） | Button outline 变体默认、Switch | `button.tsx:18`、`switch.tsx:16` |
| `shadow-sm` | 弱 | Card 默认、锁定图标框、Tabs active | `card.tsx:12`、`image-modal.tsx:413` |
| `shadow-md` | 中 | 搜索建议下拉、Select 下拉（全站 2 处） | `search-bar.tsx:117`、`select.tsx:64` |
| `shadow-lg` | 强 | 渐变主按钮、移动端关闭按钮、登录图标块/登录按钮 | `image-modal.tsx:332,468`、`login-modal.tsx:75,143` |
| `shadow-2xl` | 最强（浮层） | Dialog / AlertDialog / ImageModal / Toast | `dialog.tsx:63`、`alert-dialog.tsx:57`、`image-modal.tsx:267`、`sonner.tsx:16` |
| `shadow-inner` | 内阴影 | Prompt 代码框内凹质感 | `image-modal.tsx:408` |

#### 5.2 带色阴影（着色投影）

| 类名 | 颜色·透明度 | 用途 | 来源 |
|---|---|---|---|
| `shadow-cyan-100/20` | 青 100 号色 20% | 渐变主按钮 / 登录图标块 / 登录按钮青色辉光 | `image-modal.tsx:468`、`login-modal.tsx:75,143` |
| `shadow-slate-900/15` | 石板 900 色 15% | ImageModal 弹窗大投影 | `image-modal.tsx:267` |
| `shadow-slate-900/10` | 石板 900 色 10% | Toast 弹层投影（更轻） | `sonner.tsx:16` |

> 带色阴影约定：着色投影一律走「基色 + `/10`~`/20` 低透明度」，用于青色系亮面按钮和玻璃浮层的柔和辉光，绝不用不透明的实色阴影。新增浮层请优先 `shadow-2xl`（复用），仅在需要品牌辉光时叠加 `shadow-cyan-100/20`。

### 六、背景模糊（Backdrop / Filter Blur）

#### 6.1 模糊强度速查

Tailwind v4 blur/backdrop-blur 半径：`backdrop-blur`（裸类）=8px、`md=12px`、`xl=24px`、`2xl=40px`、`3xl=64px`（滤镜 `blur-3xl` 同为 64px）。

| 类名 | 半径 | 类型 | 用途 | 来源 |
|---|---|---|---|---|
| `backdrop-blur`（无后缀） | 8px | 背景模糊 | 卡片浏览量胶囊底 | `image-card.tsx:72` |
| `backdrop-blur-md` | 12px | 背景模糊 | ImageModal 浮动上/下一张、桌面/移动关闭按钮；Toast 关闭按钮 | `image-modal.tsx:304,313,323,332`、`sonner.tsx:25` |
| `backdrop-blur-xl` | 24px | 背景模糊 | shadcn 原生 Dialog / AlertDialog / 登录弹窗玻璃底 | `dialog.tsx:63`、`alert-dialog.tsx:57`、`login-modal.tsx:70` |
| `backdrop-blur-2xl` | 40px | 背景模糊 | ImageModal 主容器 / 右面板 / 页脚；Toast 主体 | `image-modal.tsx:267,340,465`、`sonner.tsx:16` |
| `blur-3xl` | 64px | 内容滤镜模糊（非 backdrop） | ImageModal 左侧氛围背景大图（配 `opacity-20 scale-110`） | `image-modal.tsx:283` |

#### 6.2 玻璃拟态配方（模糊 + 半透明底 + 白描边）

ImageModal 与 Toast 是全站玻璃拟态的两处基准，务必成套复用：

| 层 | 底色（亮/暗） | 模糊 | 描边（亮/暗） | 阴影 | 来源 |
|---|---|---|---|---|---|
| ImageModal 容器 | `bg-white/78` / `dark:bg-zinc-950/78` | `backdrop-blur-2xl`(40px) | `border-white/30` / `dark:border-white/10` | `shadow-2xl shadow-slate-900/15` | `image-modal.tsx:267` |
| ImageModal 右面板 | `bg-white/78` / `dark:bg-zinc-950/78` | `backdrop-blur-2xl` | `border-white/30` / `dark:border-white/10`（`border-t md:border-l`） | — | `image-modal.tsx:340` |
| ImageModal 页脚 | `bg-white/78` / `dark:bg-zinc-950/78` | `backdrop-blur-2xl` | `border-white/30` / `dark:border-white/10`（`border-t`） | — | `image-modal.tsx:465` |
| Toast 主体 | `bg-white/78` / `dark:bg-zinc-950/78` | `backdrop-blur-2xl` | `border-white/30` / `dark:border-white/10` | `shadow-2xl shadow-slate-900/10` | `sonner.tsx:16` |
| Dialog / AlertDialog 基类 | `bg-background/90`（**主题自适应**，`text-foreground`） | `backdrop-blur-xl`(24px) | `border-border/60` / `dark:border-white/10` + `ring-1 ring-black/5 dark:ring-white/5` | `shadow-2xl` | `dialog.tsx:63`、`alert-dialog.tsx:57` |

> **统一标准（2026-07-22）**：磨砂玻璃**只有一个配方**——`backdrop-blur-2xl` + `bg-white/78 dark:bg-zinc-950/78` + `border-white/30 dark:border-white/10`（ImageModal 各面板与 Toast 均已对齐）。Dialog / AlertDialog **基类已统一为主题自适应** `bg-background/90 text-foreground`（不再是深色强制白字），新建业务浮层可直接用它、明暗都可读。全站唯一"强制深色"的浮层是登录弹窗（`bg-black/20` + 显式 `text-white`）。浮层内文字色规则见 §6.6。

---

<a id="sec-6"></a>

## 6. 玻璃拟态与浮层规范

本章归纳 NanoGallery 所有"浮层"（Dialog / AlertDialog / Sheet / Toast / 图片弹窗 / 登录弹窗）的玻璃拟态视觉配方与遮罩规则。全站玻璃分为两大类：**A) 主题自适应磨砂玻璃**（浅色/深色各有底色，用于图片弹窗、Toast）与 **B) 深色调玻璃**（固定深底 + 强制白字，用于 Dialog/AlertDialog 基类、登录弹窗）。两类的文字色策略不同，务必分清，否则会踩本章末尾的"红线规则"。

### 1. 通用度量前置表（本章反复引用）

| 令牌 | 含义 | 精确值 |
|---|---|---|
| `backdrop-blur-md` | 中磨砂 | `blur(12px)` |
| `backdrop-blur-xl` | 强磨砂 | `blur(24px)` |
| `backdrop-blur-2xl` | 超强磨砂 | `blur(40px)` |
| `blur-3xl`（内容滤镜，非 backdrop） | 图片氛围背景 | `blur(64px)` |
| `border`（默认线宽） | 边框 | `1px` |
| `ring-1` | 外描边环 | `1px`（box-shadow 实现） |
| `rounded-xl` | 浮层主圆角 | `0.875rem = 14px`（若主题覆写 `--radius` 则以变量为准） |
| `rounded-2xl` | （当前未使用） | `1rem = 16px` |
| `rounded-full` | 圆形按钮 | `9999px` |
| `rounded-xs` | 关闭按钮 | `0.125rem = 2px` |
| `shadow-2xl` | 浮层主阴影 | `0 25px 50px -12px rgb(0 0 0 / 0.25)` |
| `shadow-lg` | 次级阴影 | `0 10px 15px -3px rgb(0 0 0/.1), 0 4px 6px -4px rgb(0 0 0/.1)` |
| `shadow-inner` | 代码块内阴影 | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` |
| `duration-200` | 浮层进出时长 | `200ms` |
| `z-50` | 浮层/遮罩层级 | `z-index: 50` |

透明度后缀含义（贯穿全章）：`/50`=50%、`/40`=40%、`/35`=35%、`/30`=30%、`/20`=20%、`/18`=18%、`/15`=15%、`/14`=14%、`/12`=12%、`/10`=10%、`/8`=8%、`/78`=78%、`/76`=76%、`/72`=72%、`/70`=70%、`/5`=5%。

### 2. 遮罩层（Overlay）统一规范

Dialog / AlertDialog / Sheet 三者的 Overlay 类名**完全一致**，是全站唯一遮罩配方。

来源：`src/shared/ui/dialog.tsx:41`、`src/shared/ui/alert-dialog.tsx:39`、`src/shared/ui/sheet.tsx:39`

```
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
fixed inset-0 z-50 bg-black/50
```

| 属性 | 值 |
|---|---|
| 定位 | `fixed inset-0`（铺满视口） |
| 层级 | `z-50` |
| 底色 | `bg-black/50` = `oklch(0 0 0 / 0.50)` ≈ `#000000` @ 50% |
| 进出动画 | 仅 `fade`（无 blur、无 zoom） |

规则：遮罩**只做半透明黑 + 淡入淡出**，不加 `backdrop-blur`。玻璃磨砂只发生在 Content 层，不在 Overlay 层，避免双重模糊导致性能与观感问题。新增任何全屏浮层的遮罩，必须复用 `bg-black/50`，不要另调透明度。

### 3. 玻璃配方 A —— 主题自适应磨砂玻璃

底色随明暗主题切换（浅色用白、深色用近黑 `zinc-950`），用于需要"透出背后内容"的沉浸式浮层。

#### 3.1 图片弹窗 DialogContent

来源：`src/features/gallery/components/image-modal.tsx:267`

```
!max-w-[95vw] !w-full md:!max-w-[1600px] !h-[92vh]
p-0 gap-0 outline-none
border border-white/30 dark:border-white/10
shadow-2xl shadow-slate-900/15
overflow-hidden rounded-xl
bg-white/78 dark:bg-zinc-950/78
backdrop-blur-2xl
```

| 配方项 | 浅色 | 深色 |
|---|---|---|
| 底色 | `bg-white/78` = `#ffffff` @ 78% | `bg-zinc-950/78` = `oklch(0.141 0.005 285.823)` ≈ `#09090b` @ 78% |
| 磨砂 | `backdrop-blur-2xl` = `blur(40px)` | 同左 |
| 边框 | `border-white/30`（`#ffffff` @ 30%，`1px`） | `border-white/10`（`#ffffff` @ 10%，`1px`） |
| 阴影 | `shadow-2xl` + 着色 `shadow-slate-900/15`（阴影色 = `slate-900` ≈ `#0f172a` @ 15%） | 同左 |
| 圆角 | `rounded-xl` = 14px | 同左 |

注意此处用 `!max-w-` / `!w-` / `!h-` 的 `!`（important）覆盖 dialog 基类的 `max-w-[calc(100%-2rem)] sm:max-w-lg`，并用 `showCloseButton={false}`（`image-modal.tsx:268`）关掉基类右上角关闭按钮，改由内部自绘浮动关闭按钮（见 3.3）。

#### 3.2 图片弹窗右栏 / Footer（同配方的局部复用）

右信息栏与吸底 Footer 复用配方 A，但吸底 Footer 的底色透明度略降到 `/70`：

- 右栏：`bg-white/78 dark:bg-zinc-950/78 backdrop-blur-2xl`，分隔线 `border-t md:border-t-0 md:border-l border-white/30 dark:border-white/10`（来源 `image-modal.tsx:340`）
- 吸底 Footer：`bg-white/78 dark:bg-zinc-950/78 backdrop-blur-2xl`，顶边 `border-t border-white/30 dark:border-white/10`（来源 `image-modal.tsx:465`）

规则：配方 A 的分隔线在浅色恒为 `white/30`、深色恒为 `white/10`；底色透明度允许在 `72%`（主面）与 `70%`（叠加层如 Footer）之间取值，磨砂固定 `2xl`。

#### 3.3 图片弹窗内的浮动圆形按钮（玻璃小控件）

弹窗内的翻页/关闭按钮是独立的玻璃小控件，与主面板配方不同：

| 按钮 | 类名要点 | 来源 |
|---|---|---|
| 左右翻页 | `bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md rounded-full`，文字 `text-white md:text-foreground/80 md:hover:text-foreground` | `image-modal.tsx:304,313` |
| 桌面关闭（浮于图上） | `bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md rounded-full`，`text-foreground/80 hover:text-foreground dark:text-foreground/80` | `image-modal.tsx:323` |
| 移动关闭（常驻） | `fixed top-4 right-4 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md rounded-full z-[100] shadow-lg` | `image-modal.tsx:332` |

规则：图上浮动控件统一 `backdrop-blur-md`（12px）+ `rounded-full`；桌面态用低透明度黑/白（翻页 `black/20~30`、关闭 `black/20~30`；深色两者均 `white/10~20`）配 `md:opacity-0 group-hover:opacity-100`（hover 才显形），移动端关闭按钮用高对比 `black/60` 且常驻可见、层级抬到 `z-[100]`。

#### 3.4 Toast（Sonner）

来源：`src/shared/ui/sonner.tsx:15-16`

Toast 是配方 A 的另一实例，磨砂同为 `2xl`，但透明度用 `/78`，且**明确指定文字色**（浅 `text-slate-900`、深 `dark:text-zinc-50`），不继承白字：

```
border border-white/35 bg-white/78 text-slate-900
shadow-2xl shadow-slate-900/10 backdrop-blur-2xl
dark:border-white/12 dark:bg-zinc-950/78 dark:text-zinc-50
```

| 配方项 | 浅色 | 深色 |
|---|---|---|
| 底色 | `bg-white/78` = `#ffffff` @ 78% | `bg-zinc-950/78` ≈ `#09090b` @ 78% |
| 磨砂 | `backdrop-blur-2xl` = 40px | 同左 |
| 边框 | `border-white/35`（`1px`） | `border-white/12`（`1px`） |
| 文字 | `text-slate-900` ≈ `#0f172a` | `text-zinc-50` ≈ `#fafafa` |
| 阴影 | `shadow-2xl` + `shadow-slate-900/10`（`#0f172a` @ 10%） | 同左 |

标题 `title`：`text-sm font-semibold tracking-normal`（`sonner.tsx:17`）。描述 `description`：`text-xs text-slate-600 dark:text-zinc-300`（`#475569` / `#d4d4d8`，`sonner.tsx:18`）。

语义变体（仅改**边框色与文本/图标色**，底色不变）：

| 变体 | 边框（浅/深） | 强调色 | 来源 |
|---|---|---|---|
| success | `border-emerald-200/70` / `dark:border-emerald-300/20` | 整条文本 `text-emerald-500` / `dark:text-emerald-300`，标题 `[&_[data-title]]` = `emerald-500`/`dark:emerald-300`，图标 `[&_[data-icon]]` / `[&_svg]` = `emerald-400`（≈`#34d399`） | `sonner.tsx:19-20` |
| error | `border-red-200/80` / `dark:border-red-300/20`（`#fecaca`/`#fca5a5`） | — | `sonner.tsx:21` |
| warning | `border-amber-200/80` / `dark:border-amber-300/20`（`#fde68a`/`#fcd34d`） | — | `sonner.tsx:22` |
| info | `border-slate-200/80` / `dark:border-white/12` | — | `sonner.tsx:23` |

关闭按钮 `closeButton`：`border-white/40 bg-white/70 text-slate-500 backdrop-blur-md hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20 dark:hover:text-white`（`sonner.tsx:24-25`）——独立的小玻璃控件，`backdrop-blur-md`。

Sonner 同时通过 `style` 注入 CSS 变量兜底（`sonner.tsx:30-38`），核心是用 `color-mix` 让底色 = 主题背景 78%：

| 变量 | 值 |
|---|---|
| `--normal-bg` | `color-mix(in srgb, var(--background) 78%, transparent)` |
| `--normal-text` | `var(--foreground)` |
| `--normal-border` | `color-mix(in srgb, var(--border) 70%, transparent)` |
| `--success-bg` | `color-mix(in srgb, var(--background) 78%, transparent)` |
| `--success-text` | `#34d399` |
| `--success-border` | `color-mix(in srgb, #a7f3d0 80%, transparent)` |
| `--error-bg` | `color-mix(in srgb, var(--background) 78%, transparent)` |
| `--error-text` | `var(--foreground)` |
| `--error-border` | `color-mix(in srgb, #fecaca 80%, transparent)` |

### 4. 浮层基类 —— 主题自适应（Dialog / AlertDialog 统一）

> **2026-07-22 起统一**：`DialogContent` 与 `AlertDialogContent` 基类**改为主题自适应**（原为固定深色 `bg-black/20 text-white`）。两者字符串一致，明亮=白玻璃深字、暗色=近黑玻璃浅字，**默认继承色即可读**，不再是"红线坑"的来源。

#### 4.1 Dialog / AlertDialog 基类（两者字符串完全相同）

来源：`src/shared/ui/dialog.tsx:63`、`src/shared/ui/alert-dialog.tsx:57`

```
border-border/60 bg-background/90 text-foreground shadow-2xl backdrop-blur-xl
ring-1 ring-black/5 dark:border-white/10 dark:ring-white/5
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
fixed top-[50%] left-[50%] z-50 grid w-full
max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]
gap-4 rounded-xl border p-6 duration-200 sm:max-w-lg
```

| 配方项 | 明亮 | 暗色 |
|---|---|---|
| 底色 | `bg-background/90`（`#ffffff` @ 90%） | 近黑 `#0a0a0a` @ 90% |
| 文字 | `text-foreground`（近黑，**主题自适应**） | 近白 |
| 磨砂 | `backdrop-blur-xl` = `blur(24px)` | 同 |
| 边框 | `border-border/60`（主题边框 @ 60%，`1px`） | `dark:border-white/10` |
| 环 | `ring-1 ring-black/5`（`1px`） | `dark:ring-white/5` |
| 圆角 / 内边距 | `rounded-xl`(14px) / `p-6`(24px) | 同 |
| 进出 | `fade` + `zoom-95`（缩放至 95%），`duration-200` | 同 |

因基类默认 `text-foreground`，浮层内未显式设色的文本/按钮会继承主题前景色、明暗都可读——**这消除了旧版 `text-white` 继承坑**。唯一例外是"强制深色表面"的登录弹窗（4.2）。基类右上角关闭按钮：`rounded-xs opacity-70 hover:opacity-100`，图标 `[&_svg:not([class*='size-'])]:size-4`（`dialog.tsx:72`）。

#### 4.2 登录弹窗（唯一"强制深色"浮层）

来源：`src/features/auth/components/login-modal.tsx:70-71`

登录弹窗是全站**唯一刻意保持深色**的浮层：基类改主题自适应后，它把底色固定为深色 `bg-black/20` 并**自带 `text-white`**（靠这行显式白字维持"深底浅字"），无边框、仅留 `ring`，内部文字/控件全部显式设色（见下）：

```
sm:max-w-[400px] border-none bg-black/20 text-white backdrop-blur-xl
shadow-2xl ring-1 ring-white/10 dark:ring-white/5
p-0 overflow-hidden
```

内层再叠一张**斜向渐变高光片**（`pointer-events-none`，仅装饰）：

```
absolute inset-0 bg-gradient-to-br
from-white/18 via-slate-200/8 to-cyan-100/14
pointer-events-none
```

| 渐变停点 | 颜色 | 透明度 |
|---|---|---|
| from | `white` = `#ffffff` | 18% |
| via | `slate-200` ≈ `#e2e8f0` | 8% |
| to | `cyan-100` ≈ `#cffafe` | 14% |

登录弹窗内所有文字/输入均**显式指定颜色**以适配深底：标题用渐变裁字 `bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70`（`login-modal.tsx:79`），描述 `text-zinc-400`（`#a1a1aa`，`login-modal.tsx:82`），Label `text-zinc-400`（`login-modal.tsx:91,109`），图标 `text-zinc-500` / 聚焦 `group-focus-within:text-cyan-100`（`login-modal.tsx:95,113`），输入框 `bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-cyan-100/60 rounded-xl`（`login-modal.tsx:103,121`）。图标容器 `rounded-xl bg-gradient-to-br from-white via-slate-200 to-cyan-100`，内嵌图标 `text-slate-900`（`login-modal.tsx:75-76`）。主按钮为品牌浅色渐变 `from-slate-200 via-white to-cyan-100 text-slate-950`（深字压浅底，`rounded-xl`，`login-modal.tsx:143`）。错误条 `text-red-400 bg-red-500/10 border-red-500/20`（`login-modal.tsx:134`）。

> 注意：登录弹窗未传 `showCloseButton={false}`，故仍带基类右上角 `text-white` 关闭按钮（深底可见，无需覆写）。

### 5. Sheet —— 不玻璃的对照项

来源：`src/shared/ui/sheet.tsx:61`

Sheet 面板**不是玻璃**，用不透明主题背景，务必不要误当成玻璃改成半透明：

```
bg-background flex flex-col gap-4 shadow-lg
transition ease-in-out fixed z-50
data-[state=closed]:duration-300 data-[state=open]:duration-500
```

| 属性 | 值 |
|---|---|
| 底色 | `bg-background`（不透明，无 blur） |
| 阴影 | `shadow-lg` |
| 边框 | 按 `side` 取 `border-l`（右）/`border-r`（左）/`border-b`（顶）/`border-t`（底），`1px`（`sheet.tsx:63-69`） |
| 宽度 | 左右侧 `w-3/4 sm:max-w-sm`；顶/底 `h-auto`（`sheet.tsx:63-69`） |
| 进出 | `slide-in/out`（无 zoom、无 fade），开 `500ms` / 关 `300ms` |
| 标题色 | `text-foreground`（`sheet.tsx:111`，显式，正确做法） |

### 6. 浮层文字色规则（原"红线"，已大幅简化）

**2026-07-22 起**：`DialogContent` / `AlertDialogContent` 基类已统一为 `text-foreground`（主题自适应，见 4.1）。因此**标准浮层内未显式设色的文本/图标会自动取主题前景色、明暗都可读**——旧版"白字白底不可见"的红线坑已消除。

仍需遵守两条：

1. **"强制深色 / 彩底"表面要逐元素显式给色**（不能靠继承）：
   - 登录弹窗（`bg-black/20` + 显式 `text-white`，全站唯一强制深色浮层）：内部文本用浅色（`text-white` / `text-zinc-400`），下挂的浅色控件（浅渐变按钮/图标容器）反转为深字（`text-slate-950` / `text-slate-900`）。见 4.2。
   - 图上 / 彩底浮动控件：如图片弹窗翻页/关闭 `text-white md:text-foreground/80`、点赞/分享 icon `text-muted-foreground`（`image-modal.tsx`）。
2. **Toast** 底色随主题变，已在 classNames 里对 toast/title/description 全部显式设色（`sonner.tsx:16-18`）；新增变体同样显式给色。

一句话：**标准浮层已主题自适应、可放心继承；只有"强制深色 / 彩底"表面才需逐元素写死颜色。**

---

<a id="sec-7"></a>

## 7. 按钮规范

本项目所有按钮统一基于 `src/shared/ui/button.tsx` 的 `Button` 组件与 `buttonVariants`（`class-variance-authority` 定义）。除极少数纯装饰性/浮层图标按钮直接用原生 `<button>` 外（见 image-modal 中的翻页/关闭按钮），**新建按钮一律使用 `<Button>` 组件**，通过 `variant` + `size` 组合，而非手写类名。

组件签名（`src/shared/ui/button.tsx:41-50`）：`Button` 接收 `variant`、`size`、`asChild`、以及原生 `<button>` 全部属性。`asChild=true` 时用 Radix `Slot`（`src/shared/ui/button.tsx:51`）渲染，把类合并到子元素（用于把 `<Link>`/`<a>` 变成按钮外观）。`defaultVariants` 为 `variant: 'default'` + `size: 'default'`（`src/shared/ui/button.tsx:34-37`），即不传参时是主色实心中号按钮。

### 圆角刻度（先厘清，后面反复用到）

`rounded-*` 工具在 Tailwind v4 下映射到 `@theme inline` 里定义的 `--radius-*`，全部基于 `--radius: 0.625rem`（= 10px，`src/app/globals.css:31`）派生（`src/app/globals.css:104-107`）：

| 类 | 变量 | 计算 | 精确值 |
| --- | --- | --- | --- |
| `rounded-sm` | `--radius-sm` | `calc(var(--radius) - 4px)` | 10px − 4px = **6px** |
| `rounded-md` | `--radius-md` | `calc(var(--radius) - 2px)` | 10px − 2px = **8px** |
| `rounded-lg` | `--radius-lg` | `var(--radius)` | **10px**（0.625rem） |
| `rounded-xl` | `--radius-xl` | `calc(var(--radius) + 4px)` | 10px + 4px = **14px** |

> 注意坑：`rounded-md` 在本项目是 **8px**，不是 Tailwind 原生默认的 0.375rem(6px)——因为 `--radius-md` 被覆盖过。按钮基类与 `sm`/`lg` size 都用 `rounded-md`，都是 8px。

### 基类（所有变体共享）

来源 `src/shared/ui/button.tsx:10`，逐项拆解：

| 类名 | 作用 | 精确值 |
| --- | --- | --- |
| `inline-flex items-center justify-center` | 行内弹性盒，内容水平垂直居中 | — |
| `gap-2` | 图标与文字间距 | 0.5rem = 8px |
| `whitespace-nowrap` | 文字不换行 | — |
| `rounded-md` | 圆角 | `var(--radius-md)` = `calc(var(--radius) - 2px)` = **8px** |
| `text-sm font-medium` | 字号/字重 | 0.875rem = 14px / 500 |
| `transition-all` | 全属性过渡（含 hover 背景、`ring`、`scale`） | 默认时长 150ms |
| `disabled:pointer-events-none` | 禁用时不响应指针 | — |
| `disabled:opacity-50` | 禁用时半透明 | opacity 0.5 |
| `[&_svg]:pointer-events-none` | 内部 svg 不吃指针事件 | — |
| `[&_svg:not([class*='size-'])]:size-4` | 未显式指定尺寸的 svg 默认 16px | 1rem = 16px |
| `shrink-0 [&_svg]:shrink-0` | 按钮及内部 svg 不被压缩 | — |
| `outline-none` | 去掉浏览器默认 outline | — |

聚焦态（键盘可见焦点）：`focus-visible:border-ring` + `focus-visible:ring-ring/50` + `focus-visible:ring-[3px]`（`src/shared/ui/button.tsx:10`）。即 **焦点环宽 3px**，颜色为 `--ring`（亮色 `oklch(0.708 0 0)` ≈ `#b3b3b3`，`src/app/globals.css:25`；暗色 `oklch(0.439 0 0)` ≈ `#6b6b6b`，`src/app/globals.css:61`）叠加 **50% 透明度**。

校验错误态：`aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`（`src/shared/ui/button.tsx:10`），即给 `aria-invalid` 元素套红色环（亮色 20% / 暗色 40% 透明度）+ 红色边框。

> 规则：需要焦点可见时不要用 `focus:`，本组件的焦点样式绑定在 `focus-visible:` 上（仅键盘触发），鼠标点击不会显示 3px 环。禁用请用原生 `disabled` 属性触发 `disabled:opacity-50`，不要手写灰色。

### 6 个 variant

来源 `src/shared/ui/button.tsx:13-24`。相关颜色令牌（`src/app/globals.css`，亮/暗双值）：

| 令牌 | 亮色 oklch / ≈hex（globals.css 行） | 暗色 oklch / ≈hex（globals.css 行） |
| --- | --- | --- |
| `--primary` | `0.205 0 0` ≈ `#343434`（:13） | `0.985 0 0` ≈ `#fafafa`（:49） |
| `--primary-foreground` | `0.985 0 0` ≈ `#fafafa`（:14） | `0.205 0 0` ≈ `#343434`（:50） |
| `--secondary` / `--secondary-foreground` | `0.97 0 0` ≈ `#f7f7f7` / `0.205 0 0`（:15-16） | `0.269 0 0` ≈ `#444` / `0.985 0 0`（:51-52） |
| `--accent` / `--accent-foreground` | `0.97 0 0` ≈ `#f7f7f7` / `0.205 0 0`（:19-20） | `0.269 0 0` ≈ `#444` / `0.985 0 0`（:55-56） |
| `--muted-foreground` | `0.556 0 0` ≈ `#8f8f8f`（:18） | `0.708 0 0` ≈ `#b3b3b3`（:54） |
| `--destructive` | `0.577 0.245 27.325` ≈ `#e0402a`（:21） | `0.396 0.141 25.723` ≈ `#8a2e22`（:57） |
| `--background` | `1 0 0` = `#ffffff`（:7） | `0.145 0 0` ≈ `#252525`（:43） |
| `--border` | `0.922 0 0` ≈ `#e5e5e5`（:23） | `0.269 0 0` ≈ `#444`（:59） |

| variant | 完整类 | resting 外观 | hover | 用途 |
| --- | --- | --- | --- | --- |
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` | 主色实心（亮色近黑底白字/暗色白底黑字） | 背景降到 90% 不透明 | 页面主操作、表单提交、`CopyPromptButton` 默认样式 |
| `destructive` | `bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60` | 红底白字 | 背景 90% | 删除/不可逆操作 |
| `outline` | `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50` | 1px 边框 + 背景色，`shadow-xs` 极浅阴影 | 背景变 `accent`、文字变 `accent-foreground` | 次要操作、与主按钮并列的“取消/返回” |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | 浅灰实心 | 背景 80% | 工具条、弱化的成组操作；image-modal 复制角标即用它（`src/features/gallery/components/image-modal.tsx:433`） |
| `ghost` | `hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50` | **完全透明、无背景无文字色** | 悬停才出现 `accent` 背景 + 文字色 | 图标按钮、低干扰操作（点赞/分享，`image-modal.tsx:355-366`） |
| `link` | `text-primary underline-offset-4 hover:underline` | 主色文字、无下划线 | 出现下划线（offset 4px = 0.25rem） | 文字型跳转链接 |

> 关键坑（浮层内文字色继承）：`outline` 与 `ghost` 的 resting 态**都不设置自身文字颜色**——`outline` 只有 hover 才给 `text-accent-foreground`，`ghost` resting 态完全没有文字色。它们默认继承父容器的 `color`。在深色/玻璃拟态浮层（如 `login-modal` 的 `bg-black/20` 面板 `src/features/auth/components/login-modal.tsx:70`、`image-modal` 的 `bg-white/78 dark:bg-zinc-950/78` `image-modal.tsx:267`）里放 `ghost`/`outline` 按钮时，**必须显式补文字色**，否则会继承出对比度不足甚至不可见的颜色。项目里的做法就是补 `text-muted-foreground`（如分享按钮 `variant="ghost" ... className="rounded-full text-muted-foreground"`，`image-modal.tsx:364`），点赞按钮按状态在 `text-muted-foreground` 与 `text-pink-500` 之间切换（`image-modal.tsx:358`）。

### size

来源 `src/shared/ui/button.tsx:25-32`。注意 `sm`/`lg` 会**把圆角显式设为 `rounded-md`（8px）**并调整内边距；含 svg 时用 `has-[>svg]:px-*` 收窄水平内边距。

| size | 类 | 高度/尺寸 | 水平 padding | 含 svg 时 padding | 说明 |
| --- | --- | --- | --- | --- | --- |
| `default` | `h-9 px-4 py-2 has-[>svg]:px-3` | h-9 = 2.25rem = 36px | px-4 = 1rem = 16px | px-3 = 12px | 标准按钮 |
| `sm` | `h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5` | h-8 = 2rem = 32px | px-3 = 12px | px-2.5 = 10px | 间距收紧为 gap-1.5 = 6px；`CopyPromptButton` 默认 `size="sm"` |
| `lg` | `h-10 rounded-md px-6 has-[>svg]:px-4` | h-10 = 2.5rem = 40px | px-6 = 1.5rem = 24px | px-4 = 16px | 强调型按钮 |
| `icon` | `size-9` | 2.25rem = 36px 正方形 | — | — | 标准纯图标按钮 |
| `icon-sm` | `size-8` | 2rem = 32px 正方形 | — | — | 紧凑图标 |
| `icon-lg` | `size-10` | 2.5rem = 40px 正方形 | — | — | 大图标按钮 |

> image-modal 的复制角标是 `size="icon"`（36px）再用 `className="... h-8 w-8"` 覆盖回 32px（`image-modal.tsx:432-434`）——需要 32px 图标按钮时可直接用 `size="icon-sm"`，此处属历史写法。

> 规则：`icon*` 尺寸不含文字 padding，**只放单个图标**，配 `aria-label`（无障碍必需，见 image-modal 各按钮）。图标默认 16px（基类 `[&_svg:not([class*='size-'])]:size-4`），若要放大需在 svg 上显式给 `h-5 w-5` 等以覆盖（如点赞 `Heart` 用 `h-5 w-5 md:h-6 md:w-6`，`image-modal.tsx:362`）。

### 特殊主 CTA — 冰蓝渐变按钮

品牌级主行动按钮（“Generate with this Prompt”弹窗底部、登录提交）不用 `variant`，而是在 `variant=default` 基础上用 `className` 覆盖为**冷调渐变**。这是全站唯一的高强调 CTA 样式，务必保持一致。

image-modal 底部（`src/features/gallery/components/image-modal.tsx:466-474`），`size="lg"` + 覆盖高度：

```
w-full font-semibold h-11 md:h-12 text-sm md:text-base shadow-lg shadow-cyan-100/20
bg-gradient-to-r from-slate-200 via-white to-cyan-100
hover:from-white hover:via-slate-100 hover:to-cyan-50
text-slate-950 border-0
```

login-modal 提交按钮（`src/features/auth/components/login-modal.tsx:140-143`），`h-10` + 交互缩放：

```
w-full h-10 bg-gradient-to-r from-slate-200 via-white to-cyan-100
hover:from-white hover:via-slate-100 hover:to-cyan-50
text-slate-950 border-0 shadow-lg shadow-cyan-100/20 rounded-xl
transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
```

渐变按钮固定规范：

| 项 | 值 | 说明 |
| --- | --- | --- |
| 渐变方向 | `bg-gradient-to-r` | 从左到右线性渐变 |
| 渐变停靠 | `from-slate-200`→`via-white`→`to-cyan-100` | slate-200 ≈ `#e2e8f0`、white `#fff`、cyan-100 ≈ `#cffafe` |
| hover 渐变 | `from-white via-slate-100 to-cyan-50` | 整体提亮（slate-100 ≈ `#f1f5f9`、cyan-50 ≈ `#ecfeff`） |
| 文字色 | `text-slate-950` ≈ `#020617` | **深色文字**（因底为浅冰色），不可继承 |
| 边框 | `border-0` | 去掉边框 |
| 阴影 | `shadow-lg shadow-cyan-100/20` | 大阴影 + 20% 青色染色 |
| 高度 | 弹窗 `h-11`(2.75rem=44px)/`md:h-12`(3rem=48px)；登录 `h-10`(40px) | — |
| 圆角 | 登录用 `rounded-xl`(14px)；弹窗沿用 `lg` 的 `rounded-md`(**8px**) | — |
| 交互（仅登录） | `hover:scale-[1.02] active:scale-[0.98]`、`transition-all duration-300` | 悬停微放大、按下微缩 |

登录 CTA 的 loading 态用 `Loader2` 图标 + `animate-spin`（`login-modal.tsx:147`）+ 文案“验证中...”（`login-modal.tsx:148`）；非 loading 文案为“登 录”（`login-modal.tsx:150`）；禁用条件为 `loading || (turnstileEnabled && !turnstileToken)`（`login-modal.tsx:142`）。弹窗 CTA 通过 `copied`/`isPromptContentPublic` 切换文案“Copied to Clipboard!” / “Generate with this Prompt” / “Prompt 内容暂未公开”（`image-modal.tsx:473`），并有前置 `Sparkles` 图标 `h-5 w-5 mr-2`（`image-modal.tsx:472`）。

> 品牌配套：login-modal 顶部图标徽章用**斜向线性渐变（to bottom-right，左上→右下）** `bg-gradient-to-br from-white via-slate-200 to-cyan-100`（`login-modal.tsx:75`，容器 `h-12 w-12 rounded-xl`），标题用 `bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70` 做渐变文字（`login-modal.tsx:79`）。CTA 与徽章共用 `shadow-cyan-100/20`，保持视觉家族一致。

### 纯图标按钮的可见性规则

浮层里的图标按钮多为 `variant="ghost"`（无 resting 背景/文字色），因此 **resting 态必须显式给一个可见文字色，hover 再变色**。项目定式：

- 分享按钮：`text-muted-foreground` 常驻（`image-modal.tsx:364`）。
- 点赞按钮：未点赞 `text-muted-foreground`，已点赞 `text-pink-500 bg-pink-500/10`，hover 一律 `hover:bg-pink-500/10 hover:text-pink-500`（`image-modal.tsx:358`）。图标点亮用 `fill-current`（`image-modal.tsx:362`）。
- 复制成功反馈：`Check` 图标加 `text-green-500`，未复制时 `Copy` 用继承色（此处继承 `secondary` 变体的 `text-secondary-foreground`）（`image-modal.tsx:439`）。

image-modal 中直接用原生 `<button>` 的浮动控件（翻页/关闭，`image-modal.tsx:302-336`）不走 `buttonVariants`，其可见性规则更极端：图像区背景不可控，故用半透明黑底 + `text-white` + `backdrop-blur-md` 保证在任意图片上可读。各控件底色略有差异：翻页按钮 `bg-black/20 hover:bg-black/30`（`image-modal.tsx:304,313`）、桌面关闭 `bg-black/20 hover:bg-black/30`（`image-modal.tsx:323`）、移动关闭 `bg-black/60 hover:bg-black/80`（`image-modal.tsx:332`）。桌面端控件默认 `opacity-0`，靠父级 `group-hover:opacity-100` + `duration-300` 显现；移动关闭 `fixed` 常驻可见（`z-[100]`）。

> 规则：图标按钮 resting 态**不要留空文字色**（否则玻璃浮层里可能不可见）。低强调常驻用 `text-muted-foreground`；语义色（点赞粉、成功绿、删除红）只在激活/反馈时出现。悬浮在图片等不可控背景上的按钮必须自带半透明底 + `backdrop-blur` + 明确文字色。

### 何时用哪个变体（决策指引）

| 场景 | 选择 |
| --- | --- |
| 页面/表单唯一主操作、提交、复制 Prompt | `variant="default"`（`CopyPromptButton` 即用默认 variant + `size="sm"`） |
| 品牌级高强调 CTA（生成、登录） | `default` + 冰蓝渐变 className（见上节，不要改配色） |
| 删除、清空等破坏性操作 | `variant="destructive"` |
| 与主按钮并列的次要操作（取消、返回、上一步） | `variant="outline"`（浮层内记得补文字色） |
| 成组的工具/弱化操作、浮层角标复制 | `variant="secondary"` |
| 图标按钮、低干扰内联操作（点赞、分享、更多） | `variant="ghost"` + `size="icon"`/`icon-sm` + `aria-label` + 显式 `text-muted-foreground` |
| 纯文字跳转 | `variant="link"` |
| 把链接渲染成按钮外观 | `<Button asChild><Link/></Button>` |

---

<a id="sec-8"></a>

## 8. 图标规范

### 图标库与全局约定

NanoGallery 全站图标统一使用 **`lucide-react`**（React 版 Lucide 图标集），不掺杂 Emoji、SVG 精灵图或其它图标字体。所有图标以命名导入的方式引入，例如 `import { Sparkles, Search, ChevronDown, User, Sun, Moon, LayoutDashboard } from "lucide-react"`（来源 `src/features/shell/components/sidebar.tsx:8`）。

三条铁律：

1. **描边宽度一律用 Lucide 默认值 `stroke-width=2`（2px）。** 全仓库 grep `strokeWidth` / `stroke-width` / `absoluteStrokeWidth` 无任何命中，即项目**从未覆盖过描边宽度**。以后新增图标也遵循默认 2px，不要传 `strokeWidth` prop，除非有明确设计理由并在本章补录。
2. **图标颜色一律走 `currentColor` 继承。** Lucide 图标默认 `stroke="currentColor"`，项目里没有任何一处给图标写死 `color`/`fill`（唯一例外是 `Heart` 点赞态用 `fill-current`，见下文）。因此图标颜色永远由**父元素的文字色（`text-*`）**决定 —— 这也是浮层里最常见的坑，见「浮层继承坑」。
3. **尺寸只用受控的尺寸阶梯**（见下表），不要出现 `h-[13px]` 之类的散装尺寸。

### 尺寸阶梯

Lucide 图标的渲染尺寸由 Tailwind 的宽高类控制（`h-* w-*` 或 `size-*`）。项目实际用到的尺寸只有下面 4 档，务必对号入座：

| 尺寸类 | rem | px | 使用场景 | 来源示例 |
| --- | --- | --- | --- | --- |
| `h-3.5 w-3.5` | 0.875rem | **14px** | 统计徽章 / 卡片浏览量角标 / 搜索建议下拉的 Tag 图标 | `stats-badge.tsx:28`、`image-card.tsx:73`、`search-bar.tsx:128` |
| `h-4 w-4` / `size-4` | 1rem | **16px** | 默认档：按钮内图标、输入框内图标、`Terminal`/`Loader2`、Select/Dialog 内置图标 | `sidebar.tsx:131`、`search-bar.tsx:79`、`image-modal.tsx:402/422/439`、`select.tsx:47/117` |
| `h-5 w-5` | 1.25rem | **20px** | Logo 内 `Sparkles`、`Share2`、底部大按钮内 `Sparkles`、移动端关闭 `X` | `sidebar.tsx:116`、`image-modal.tsx:365/335/472` |
| `h-6 w-6` | 1.5rem | **24px** | 弹窗级导航/关闭：`ChevronLeft`/`ChevronRight`/桌面关闭 `X`、`Lock` 空状态占位、`login-modal` 品牌 `Sparkles`、卡片加载失败 `ImageOff` | `image-modal.tsx:307/316/326/414`、`login-modal.tsx:76`、`image-card.tsx:43` |

响应式变尺寸：详情弹窗点赞 `Heart` 用 `h-5 w-5 md:h-6 md:w-6`（移动 20px → 桌面 24px，`image-modal.tsx:362`）。

**按钮内图标可省略尺寸类。** `Button`（`src/shared/ui/button.tsx:10`）基类含 `[&_svg:not([class*='size-'])]:size-4`，即放进 `<Button>` 里、且**没写 `size-*` 类**的 SVG 会被自动锁定为 16px；同时 `[&_svg]:pointer-events-none` 与 `[&_svg]:shrink-0` 保证图标不吃点击、不被压缩。`Select`/`Dialog` 也复刻了同款兜底：`[&_svg:not([class*='size-'])]:size-4`（`select.tsx:40/110`、`dialog.tsx:72`）。因此：

- 放进 `Button` 且要 16px → **不写尺寸类**即可（依赖兜底）。
- 需要非 16px（如 20px 的 `Sparkles`）→ 必须显式写 `h-5 w-5`，否则会被压回 16px。

### 图标颜色规则

图标色 = 父级文字色。按钮/图标常见三态：

| 状态 | 颜色类 | 值 | 场景 | 来源 |
| --- | --- | --- | --- | --- |
| 静息(resting) | `text-muted-foreground` | 语义灰（见色彩章） | 徽章图标、分享按钮、Select 内置箭头、搜索图标 | `stats-badge.tsx:27`、`image-modal.tsx:364`、`search-bar.tsx:79` |
| hover 提亮 | `hover:text-foreground` | 主前景色 | 侧栏搜索按钮、分类折叠标题、弹窗翻页/关闭按钮 | `sidebar.tsx:129/175`、`image-modal.tsx:304/323` |
| 激活/语义强调 | `text-pink-500`、`text-green-500`、`text-red-500` | 见下 | 点赞态、复制成功、退出登录 | `image-modal.tsx:358/439`、`sidebar.tsx:249` |

语义强调色：

- **点赞态**：按钮 `text-pink-500` + 背景 `bg-pink-500/10`，hover 态 `hover:bg-pink-500/10 hover:text-pink-500`（`image-modal.tsx:358`）；图标同时加 `fill-current`（`Heart` 填充为当前色，`image-modal.tsx:362`）。未点赞时按钮为 `text-muted-foreground` 且图标不填充。
- **复制成功**：`Check` 图标 `text-green-500`（`image-modal.tsx:439`）；未复制时显示 `Copy`，继承默认色。
- **退出登录**：`User` 图标随按钮 `text-red-500 hover:text-red-600`（按钮同时带 `hover:bg-red-500/10`，`sidebar.tsx:249`）。

弹窗图片区的浮动按钮走一套独立的深浅色继承，且**翻页按钮、桌面关闭、移动关闭三者配色不同，不要混用**：

- **翻页按钮（上一张/下一张）**：`text-white md:text-foreground/80 md:hover:text-foreground`（`image-modal.tsx:304`/`313`）—— 移动端在图片上是纯白，桌面端跟随前景色 80% 透明度、hover 提亮到 100%；深色态只改背景（`dark:bg-white/10 dark:hover:bg-white/20`），文字色不再另设 `dark:` 变体。
- **桌面关闭 `X`（`md:block hidden`，仅桌面显示）**：`text-foreground/80 hover:text-foreground dark:text-foreground/80 dark:hover:text-foreground`（`image-modal.tsx:323`），无 `text-white`。
- **移动关闭 `X`（`md:hidden`，仅移动显示）**：固定右上、底色 `bg-black/60`、图标 `text-white`（`image-modal.tsx:332`/`335`）。

### 输入框内图标模式

有两种"图标绝对定位进输入框"的写法，写法不同、务必区分：

1. **搜索框（前台）**：`Search` 用 `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`（`search-bar.tsx:79`），输入框配 `pl-10 pr-20` 给左图标 + 右侧两个按钮腾位（`search-bar.tsx:89`）。清空 `X` 与提交 `Search` 是 `size="icon"` 但被覆盖为 `h-7 w-7`（1.75rem = 28px）的幽灵按钮，绝对定位在 `right-9` / `right-1`（`search-bar.tsx:97/108`），内部图标各为 `h-4 w-4`（`search-bar.tsx:101/111`）。

2. **登录框（暗色玻璃浮层）**：图标包一层 `absolute left-3 top-2.5` 的 div，静息色 `text-zinc-500`，**聚焦时靠父级 `group` + `group-focus-within:text-cyan-100` 提亮为青白色**（`login-modal.tsx:94-96`、`112-114`）。输入框用 `pl-9` 让位（`login-modal.tsx:103/121`）。这是登录浮层专属配色，前台搜索框**不要**照搬 `text-zinc-500`/`text-cyan-100`。

| 模式 | 静息色 | 聚焦色 | 定位 | 输入框内边距 |
| --- | --- | --- | --- | --- |
| 前台搜索 | `text-muted-foreground` | 不变 | `left-3 top-1/2 -translate-y-1/2` | `pl-10 pr-20` |
| 登录浮层 | `text-zinc-500` | `group-focus-within:text-cyan-100` | `left-3 top-2.5` | `pl-9` |

### 浮层继承坑（必须遵守）

`DialogContent` 基类带 `text-white`（`dialog.tsx:63`），`login-modal` 的 `DialogContent` 又叠了 `border-none bg-black/20 backdrop-blur-xl`（`login-modal.tsx:70`）——**弹窗内默认文字/图标色是白色**。因此：

- 放进这类深色浮层的图标，若不显式指定颜色，会是白色。登录框品牌 `Sparkles` 特意用 `text-slate-900`（`login-modal.tsx:76`）压成深色，才能在浅色渐变徽标底（`bg-gradient-to-br from-white via-slate-200 to-cyan-100`）上可见。
- `image-modal` 的 `DialogContent` 用 `bg-white/78 dark:bg-zinc-950/78` 覆盖了底色（`image-modal.tsx:267`），内部图标改回 `text-foreground`/`text-muted-foreground` 体系，跟随明暗模式。
- **规则**：往任何 `Dialog`/浮层里塞图标或带文字的按钮时，不能假设继承的是页面前景色，必须确认当前浮层的实际文字底色，必要时显式写 `text-*`。

### 组件内置图标（Select / Dialog）

这些图标由 shadcn 组件内部渲染，不需手动传入，但要知道它们的存在与命名（用的是 lucide 的 `*Icon` 别名）：

| 组件 | 图标 | 尺寸 | 语义 | 来源 |
| --- | --- | --- | --- | --- |
| `SelectTrigger` | `ChevronDownIcon` | `size-4` + `opacity-50` | 下拉触发箭头（半透明） | `select.tsx:47` |
| `SelectItem` | `CheckIcon` | `size-4`（外层 `size-3.5` 容器） | 选中项对勾 | `select.tsx:115-118` |
| `SelectScrollUpButton` | `ChevronUpIcon` | `size-4` | 列表上滚 | `select.tsx:151` |
| `SelectScrollDownButton` | `ChevronDownIcon` | `size-4` | 列表下滚 | `select.tsx:169` |
| `DialogContent`(默认) | `XIcon` | `size-4`（兜底）+ `opacity-70 hover:opacity-100` | 右上角关闭 | `dialog.tsx:72-74` |

注意 `image-modal` 关掉了默认关闭按钮（`showCloseButton={false}`，`image-modal.tsx:268`），改用自定义的浮动 `X`（桌面 `h-6 w-6` / 移动 `h-5 w-5`，`image-modal.tsx:326/335`）。Select 触发器还有 `[&_svg:not([class*='text-'])]:text-muted-foreground` 规则（`select.tsx:40`）、Select 选项也有同款规则（`select.tsx:110`）：未显式指定颜色的内部图标自动为静息灰。

### 图标清单（全仓库 grep 汇总）

下表覆盖 `src/` 下所有 `lucide-react` 导入。语义 = 项目里的实际用途；带 `Icon`/别名后缀的是导入时重命名（如 `Copy as CopyIcon`、`Settings as SettingsIcon`、`Image as ImageIcon`）。

| 图标 | 语义/用途 | 典型出处 |
| --- | --- | --- |
| `Sparkles` | 品牌标识 / "全部"导航 / 生成按钮 / 登录品牌徽标 | `sidebar.tsx:116/80`、`image-modal.tsx:472`、`login-modal.tsx:76` |
| `Search` | 搜索入口、搜索框内图标、提交按钮、后台列表搜索 | `sidebar.tsx:131`、`search-bar.tsx:79/111`、`admin-prompt-list.tsx` |
| `Copy` / `Copy as CopyIcon` | 复制 Prompt（未复制态）、统计"复制数"图标 | `image-modal.tsx:439`、`stats-badge.tsx:3/35`、`copy-prompt-button.tsx` |
| `Check` / `CheckIcon` | 复制成功态（绿）、Select 选中对勾 | `image-modal.tsx:439`、`copy-prompt-button.tsx`、`select.tsx:117` |
| `Heart` | 点赞（`fill-current` 填充态）、统计"点赞数" | `image-modal.tsx:362`、`stats-badge.tsx:42`、`admin-prompt-list.tsx` |
| `Share2` | 分享（系统分享/复制链接回退） | `image-modal.tsx:365` |
| `X` / `XIcon` | 关闭弹窗 / 清空搜索 / 移除标签 / Dialog·Sheet 默认关闭 | `image-modal.tsx:326/335`、`search-bar.tsx:101`、`dialog.tsx:74`、`sheet.tsx` |
| `ChevronLeft` | 弹窗上一张、详情页返回 | `image-modal.tsx:307`、`prompt/[id]/page.tsx` |
| `ChevronRight` | 弹窗下一张 | `image-modal.tsx:316` |
| `ChevronDown` / `ChevronDownIcon` | 分类折叠箭头（`rotate-180` 展开态）、Select 箭头/下滚 | `sidebar.tsx:178`、`select.tsx:47/169` |
| `ChevronUpIcon` | Select 列表上滚 | `select.tsx:151` |
| `Eye` | 浏览量：卡片角标、统计徽章、后台列表 | `image-card.tsx:73`、`stats-badge.tsx:28` |
| `Lock` | 内容未公开占位、登录密码框、后台锁定态、登录页 | `image-modal.tsx:414`、`login-modal.tsx:114`、`prompt-form.tsx`、`login/page.tsx` |
| `Unlock` | 后台表单"解锁/公开"切换 | `prompt-form.tsx` |
| `Terminal` | "Prompt" 区块小标题图标 | `image-modal.tsx:402` |
| `Loader2` | 加载旋转（配 `animate-spin`） | `image-modal.tsx:422`、`login-modal.tsx:147`、`tags/page.tsx`、`categories/page.tsx` |
| `Menu` | 移动端汉堡菜单 | `mobile-sidebar.tsx` |
| `User` | 账号/登录/退出登录、登录账号框 | `sidebar.tsx:254/264`、`login-modal.tsx:96`、`mobile-sidebar.tsx` |
| `Sun` / `Moon` | 主题切换（暗色显示 Sun，浅色显示 Moon） | `sidebar.tsx:239/241`、`theme-toggle.tsx`、`admin-sidebar.tsx` |
| `LayoutDashboard` | 进入后台 / 后台仪表盘导航 | `sidebar.tsx:225`、`admin-sidebar.tsx`、`mobile-sidebar.tsx` |
| `ImageOff` | 图片加载失败占位 | `image-card.tsx:43` |
| `Image as ImageIcon` | 后台列表图片列 | `admin-prompt-list.tsx` |
| `Images` | 后台健康页图片统计 | `health/page.tsx` |
| `Tag` | 搜索建议里的标签图标（`opacity-70`） | `search-bar.tsx:128` |
| `Tags` | 后台"标签管理"导航 | `admin-sidebar.tsx` |
| `Save` | 后台保存（设置/标签） | `settings/page.tsx`、`tags/page.tsx` |
| `Settings as SettingsIcon` | 后台设置 | `settings/page.tsx`、`admin-sidebar.tsx` |
| `Upload` / `UploadCloud` | 图片上传 / 健康页上传统计 | `prompt-form.tsx`、`health/page.tsx` |
| `Plus` | 新建（Prompt/标签/分类） | `admin-sidebar.tsx`、`tags/page.tsx`、`categories/page.tsx` |
| `Edit` / `Pencil` | 编辑 Prompt / 编辑标签 | `admin-prompt-list.tsx`、`tags/page.tsx` |
| `Trash2` | 删除（Prompt/标签/分类） | `admin-prompt-list.tsx`、`tags/page.tsx`、`categories/page.tsx` |
| `LogOut` | 后台退出登录 | `admin-sidebar.tsx` |
| `Home` | 后台"返回前台"导航 | `admin-sidebar.tsx` |
| `FolderTree` | 分类管理 | `admin-sidebar.tsx`、`categories/page.tsx` |
| `Activity` | 后台健康/活动监控 | `admin-sidebar.tsx`、`health/page.tsx` |
| `Database` | 健康页数据存储状态 | `health/page.tsx` |
| `AlertTriangle` | 健康页告警态 | `health/page.tsx` |
| `CheckCircle2` | 健康页正常态 | `health/page.tsx` |
| `RefreshCw` | 刷新（健康页 / 标签输入重取） | `health/page.tsx`、`simple-tag-input.tsx` |
| `RotateCcw` | 后台列表重置筛选 | `admin-prompt-list.tsx` |
| `CheckSquare` / `Square` | 后台列表多选选中/未选 | `admin-prompt-list.tsx` |

**新增图标规则**：优先复用上表已有语义（如"删除"永远 `Trash2`、"编辑"永远 `Edit`/`Pencil`、"加载"永远 `Loader2` + `animate-spin`），不要为同一语义引入第二个图标；导入重命名时沿用现有别名约定（`*Icon` 或组件内 `Copy as CopyIcon`）。

---

<a id="sec-9"></a>

## 9. 表单控件

本章覆盖 NanoGallery 后台表单所使用的全部基础输入控件：`Input`、`Textarea`、`Label`、`Select`、`Switch`，以及业务组合控件 `SimpleTagInput`，并以 `PromptForm` 为落地范例说明约定与坑。

所有颜色引用自 `src/app/globals.css` 的设计令牌（`:root` 亮色 / `.dark` 暗色）。这些中性令牌与 Tailwind `neutral` 色阶一一对应（如 `oklch(0.269 0 0)` = neutral-800）。为便于回查，下表先给出本章涉及的令牌真值（oklch 原值 + 近似 hex）：

| 令牌 | 亮色 oklch | 亮色近似 hex | 暗色 oklch | 暗色近似 hex | 来源 |
|---|---|---|---|---|---|
| `--input` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#262626` | globals.css:24 / :60 |
| `--ring` | `oklch(0.708 0 0)` | `#a1a1a1` | `oklch(0.439 0 0)` | `#525252` | globals.css:25 / :61 |
| `--border` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#262626` | globals.css:23 / :59 |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#737373` | `oklch(0.708 0 0)` | `#a1a1a1` | globals.css:18 / :54 |
| `--muted` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` | globals.css:17 / :53 |
| `--primary` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` | globals.css:13 / :49 |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.205 0 0)` | `#171717` | globals.css:14 / :50 |
| `--secondary` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` | globals.css:15 / :51 |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` | globals.css:16 / :52 |
| `--accent` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` | globals.css:19 / :55 |
| `--accent-foreground` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` | globals.css:20 / :56 |
| `--popover` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#0a0a0a` | globals.css:11 / :47 |
| `--popover-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | `oklch(0.985 0 0)` | `#fafafa` | globals.css:12 / :48 |
| `--background` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#0a0a0a` | globals.css:7 / :43 |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#e5484d` | `oklch(0.396 0.141 25.723)` | `#8b2c2c` | globals.css:21 / :57 |

圆角令牌（`--radius: 0.625rem = 10px`，globals.css:31）：`rounded-sm = calc(radius-4px) = 6px`、`rounded-md = calc(radius-2px) = 8px`、`rounded-lg = radius = 10px`、`rounded-xl = calc(radius+4px) = 14px`、`rounded-full = 9999px`（globals.css:104-107）；裸 `rounded` = `0.25rem = 4px`（Tailwind 默认，见推荐标签按钮）。

### 全局约定（务必遵守）

- **统一控件高度 = `h-9` = `2.25rem` = 36px**：`Input`、`Select` 默认 Trigger 都是 36px；`Select` 小号 `data-[size=sm]` = `h-8` = `2rem` = 32px。同一行并排的输入类控件应保持 36px 基线。
- **统一焦点环 = `focus-visible:ring-[3px]` = 3px**，颜色 `ring-ring/50`（`--ring` 的 50% 透明度），并伴随 `focus-visible:border-ring` 把边框换成不透明 `--ring`。所有控件焦点态一致，不要自定义成 1px/2px。
- **统一描边 = `border` = 1px**，颜色 `border-input`（`--input`）。
- **统一背景 = `bg-transparent`**（继承容器底色），暗色下叠加 `dark:bg-input/30`（`--input` 的 30% 透明度）做轻微填充。
- **统一投影 = `shadow-xs`**（`0 1px 2px 0 rgb(0 0 0 / 0.05)`）。
- **统一过渡 = `transition-[color,box-shadow]`**，只对颜色与 box-shadow 过渡，避免布局抖动（注意 `Switch` 例外，用的是 `transition-all`）。
- **错误态 = `aria-invalid` 驱动**：设 `aria-invalid` 后，环变红 `aria-invalid:ring-destructive/20`（暗色 `/40`）、边框变红 `aria-invalid:border-destructive`。要报错就设 `aria-invalid`，不要手改 className。
- **禁用态**：`disabled:opacity-50` + `disabled:cursor-not-allowed`（`Input` 额外 `disabled:pointer-events-none`）。
- **字号响应式坑**：所有文本输入类控件默认 `text-base`（16px），仅在 `md` 及以上降为 `text-sm`（14px）——即 `text-base md:text-sm`。移动端故意用 16px 以避免 iOS Safari 聚焦时自动缩放。不要为了"看起来统一"去掉 `text-base`。（`Select` Trigger 是例外：固定 `text-sm` = 14px，无 `text-base`。）

### Input

来源 `src/shared/ui/input.tsx:12-16`（className 集中在 13-15 行）。

| 属性 | 类名 | 落地值 |
|---|---|---|
| 高度 | `h-9` | 2.25rem = 36px |
| 宽度 | `w-full min-w-0` | 100%，允许收缩到 0 |
| 圆角 | `rounded-md` | 8px |
| 边框 | `border` + `border-input` | 1px，`--input` |
| 背景 | `bg-transparent` / `dark:bg-input/30` | 透明 / 暗色 `--input` 30% |
| 内边距 | `px-3 py-1` | 左右 0.75rem=12px，上下 0.25rem=4px |
| 字号 | `text-base md:text-sm` | 16px → md 起 14px |
| 投影 | `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 /0.05)` |
| 轮廓 | `outline-none` | 去掉浏览器默认 outline，靠 ring 替代 |
| 占位符 | `placeholder:text-muted-foreground` | `--muted-foreground` |
| 选区 | `selection:bg-primary selection:text-primary-foreground` | 选中文字用 primary 反白 |
| 焦点 | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` | 3px 环 |
| 错误 | `aria-invalid:ring-destructive/20 dark:…/40 aria-invalid:border-destructive` | 红环红框 |
| 禁用 | `disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50` | — |
| 文件输入 | `file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium` | `type=file` 时的伪按钮高 `h-7`=28px |

用法约定：表单里给 `Input` 加 `className="bg-background"` 覆盖透明背景，使其在卡片内有实底（`PromptForm` 标题/描述输入均如此，prompt-form.tsx:363、374）。校验用原生 `required`（prompt-form.tsx:364、375），而非 `aria-invalid`。

### Textarea

来源 `src/shared/ui/textarea.tsx:11-14`（className 在 12 行）。与 `Input` 同族，差异如下：

| 属性 | 类名 | 落地值 |
|---|---|---|
| 高度 | `min-h-16` | 最小 4rem = 64px（无固定高） |
| 自适应 | `field-sizing-content` | 随内容自动扩高 |
| 内边距 | `px-3 py-2` | 12px / 8px（比 Input 的 `py-1` 高） |
| 布局 | `flex w-full` | — |

其余（`rounded-md`、`border-input`、`bg-transparent`/`dark:bg-input/30`、`shadow-xs`、`text-base md:text-sm`、`outline-none`、`focus-visible:ring-[3px]`、`aria-invalid`、`disabled:cursor-not-allowed disabled:opacity-50`）与 Input 一致。注意 Textarea 未带 `disabled:pointer-events-none`。

用法约定：`PromptForm` 的 Prompt 内容框叠加 `min-h-[120px] font-mono text-sm`（prompt-form.tsx:397），即最小高 120px、等宽字体（`--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`，globals.css:79）、锁定 14px。

### Label

来源 `src/shared/ui/label.tsx:15-18`（className 在 16 行）。基于 `@radix-ui/react-label`。

| 属性 | 类名 | 落地值 |
|---|---|---|
| 布局 | `flex items-center gap-2` | 水平排列，图标/文字间距 0.5rem=8px |
| 字号 | `text-sm` | 14px |
| 行高 | `leading-none` | 1（紧贴） |
| 字重 | `font-medium` | 500 |
| 选择 | `select-none` | 不可选中 |
| 组禁用 | `group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50` | 父组 `data-disabled` 时置灰 |
| 关联禁用 | `peer-disabled:cursor-not-allowed peer-disabled:opacity-50` | 同级 `peer` 控件 disabled 时 Label 置灰 |

用法约定：`PromptForm` 中每个字段都是 `<div className="space-y-2"><Label>…</Label><控件/></div>` 结构，Label 与控件垂直间距 `space-y-2` = 0.5rem = 8px（prompt-form.tsx:357-366 等）。作为分组标题的 Label 用 `className="text-muted-foreground"` 弱化（元数据区，prompt-form.tsx:319）。

### Select

来源 `src/shared/ui/select.tsx`。基于 `@radix-ui/react-select`，图标来自 `lucide-react` 的 `CheckIcon` / `ChevronDownIcon` / `ChevronUpIcon`（select.tsx:5）。

**SelectTrigger**（select.tsx:36-49，className 在 40 行）：

| 属性 | 类名 | 落地值 |
|---|---|---|
| 高度 | `data-[size=default]:h-9` / `data-[size=sm]:h-8` | 默认 36px / 小号 32px |
| 宽度 | `w-fit` | 内容自适应（表单里靠外层 grid/`w-full` 撑开） |
| 布局 | `flex items-center justify-between gap-2` | 值左、箭头右，间距 8px |
| 圆角/边框/背景 | `rounded-md border border-input bg-transparent` + `dark:bg-input/30 dark:hover:bg-input/50` | 8px / 1px / 透明；暗色 hover 提亮到 50% |
| 内边距 | `px-3 py-2` | 12px / 8px |
| 字号 | `text-sm` | 14px（注意：Trigger 固定 14px，无 `text-base`） |
| 换行 | `whitespace-nowrap` | 不换行 |
| 占位色 | `data-[placeholder]:text-muted-foreground` | 未选时值文字用 `--muted-foreground` |
| 内嵌 svg | `[&_svg:not([class*='text-'])]:text-muted-foreground` `[&_svg:not([class*='size-'])]:size-4` `[&_svg]:shrink-0` `[&_svg]:pointer-events-none` | 图标默认 muted 色、16px、不收缩、不吃事件 |
| 下拉箭头 | `<ChevronDownIcon className="size-4 opacity-50" />` | 16px，50% 不透明 |
| 焦点/错误/禁用 | 同全局约定（`focus-visible:ring-[3px]` 等） | — |

**SelectContent（浮层）**（select.tsx:61-83，className 在 64 行）：`bg-popover text-popover-foreground`、`rounded-md`、`border`（1px）、`shadow-md`（`0 4px 6px -1px rgb(0 0 0/0.1)…`）、`z-50`；`min-w-[8rem]`=128px 最小宽，`max-h-(--radix-select-content-available-height)` 限高，`overflow-x-hidden overflow-y-auto`。默认 `position="popper"`，按方向偏移 `translate ±1`（`translate-y-1` = 0.25rem = 4px）。开合动画 `fade`+`zoom-95`+按边方向 `slide-in-from-*-2`（8px）。Viewport `p-1`=4px；popper 下 `min-w-[var(--radix-select-trigger-width)]` 让菜单至少与触发器同宽。

**SelectItem**（select.tsx:107-121，className 在 110 行）：

| 属性 | 类名 | 落地值 |
|---|---|---|
| 布局 | `flex w-full items-center gap-2` | — |
| 圆角 | `rounded-sm` | 6px |
| 内边距 | `py-1.5 pr-8 pl-2` | 上下 6px，右 32px（留勾选位），左 8px |
| 字号 | `text-sm` | 14px |
| 光标 | `cursor-default` | — |
| 轮廓 | `outline-hidden` | 无 outline（高亮改用背景色） |
| **焦点/悬停高亮** | `focus:bg-accent focus:text-accent-foreground` | 背景 `--accent`，文字 `--accent-foreground` |
| 选中指示 | `<CheckIcon className="size-4" />`，容器 `absolute right-2 size-3.5` | 右侧 16px 对勾，容器 14px |
| 禁用 | `data-[disabled]:pointer-events-none data-[disabled]:opacity-50` | — |

**SelectLabel**：`text-muted-foreground px-2 py-1.5 text-xs`（12px 分组标题，select.tsx:95）。**SelectSeparator**：`bg-border pointer-events-none -mx-1 my-1 h-px`（1px 分隔线，select.tsx:132）。**滚动按钮**：`ChevronUp/DownIcon size-4` + 按钮 `py-1`（select.tsx:151、169）。

> **浮层文字色继承坑（必读）**：`SelectContent` 用 `text-popover-foreground`，`SelectItem` 高亮态用 `text-accent-foreground`——都不是 `foreground`。在下拉项里再放按钮/图标时，务必让其颜色跟随 `currentColor` 或显式用 `text-popover-foreground`/`text-accent-foreground`，不要写死 `text-foreground`，否则暗色浮层里会出现对比错位。

用法约定：`PromptForm` 全部 Select 的 Trigger 加 `className="bg-background"` 给实底（prompt-form.tsx:324、339、405、419）；模型选择的 Content 加 `max-h-[300px]` 限高滚动（prompt-form.tsx:327）。

### Switch

来源 `src/shared/ui/switch.tsx`（Root className 在 16 行、Thumb className 在 24 行）。基于 `@radix-ui/react-switch`。

| 部件 | 属性 | 类名 | 落地值 |
|---|---|---|---|
| Root | 尺寸 | `h-[1.15rem] w-8` | 高 1.15rem=18.4px，宽 2rem=32px |
| Root | 圆角/边框 | `rounded-full border border-transparent` | 全圆，1px 透明边 |
| Root | 开态底色 | `data-[state=checked]:bg-primary` | `--primary` |
| Root | 关态底色 | `data-[state=unchecked]:bg-input` / `dark:…:bg-input/80` | `--input`（暗色 80%） |
| Root | 投影 | `shadow-xs` | — |
| Root | 过渡 | `transition-all` | 全属性过渡（区别于输入类的 `transition-[color,box-shadow]`） |
| Root | 焦点 | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` | 3px 环 |
| Root | 禁用 | `disabled:cursor-not-allowed disabled:opacity-50` | — |
| Thumb | 尺寸 | `size-4 rounded-full` | 16px 圆点 |
| Thumb | 底色 | `bg-background` / 暗色关态 `bg-foreground`、开态 `bg-primary-foreground` | — |
| Thumb | 位移 | `data-[state=checked]:translate-x-[calc(100%-2px)]` / `unchecked:translate-x-0` | 开态右移「自身宽-2px」= 14px |
| Thumb | 过渡 | `transition-transform` | 仅位移过渡 |

注意标准 Switch 用 `peer` 标记（switch.tsx:16），便于配合 `Label` 的 `peer-disabled`。当前 `PromptForm` 的"公开/不公开"未用 Switch，而是用 `Button` 变体切换（prompt-form.tsx:382-391，`size="sm"` + `h-8 gap-2` 小按钮 + `Unlock`/`Lock` 图标 `h-3.5 w-3.5`=14px，`variant` 在 `secondary`↔`outline` 间切换）——这是业务上的替代方案，非本组件用法。

### SimpleTagInput（标签输入）

来源 `src/shared/ui/simple-tag-input.tsx`。组合了 `Input` + 已选标签 chip + 推荐标签面板，图标 `RefreshCw`/`X`（simple-tag-input.tsx:4）。外层 `space-y-2`（8px 纵向间距，simple-tag-input.tsx:63）。

**已选标签 chip**（simple-tag-input.tsx:64-70）：容器 `flex flex-wrap gap-2 mb-2`；每个 chip `bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1`——即 `--secondary` 底、8px 圆角、上下 4px/左右 8px、14px 字、内部间距 4px；删除按钮内嵌 `<X className="w-3 h-3" />`（12px）。

**录入框**（simple-tag-input.tsx:72-76）：复用 `Input` 组件（继承 36px/`rounded-md`/3px 焦点环等全部规范），叠加 `className="bg-background"`，`placeholder="输入标签后按回车"`。交互：`Enter` 提交（`e.preventDefault()`），trim 后去重加入，重复值忽略（simple-tag-input.tsx:47-56）。

**推荐标签面板**（simple-tag-input.tsx:77-108）：

| 部件 | 类名 | 落地值 |
|---|---|---|
| 面板容器 | `mt-3 rounded-lg border border-border/60 bg-muted/20 p-3` | 上距 12px、10px 圆角、1px 边框（`--border` 60%）、`--muted` 20% 底、内边距 12px |
| 标题行 | `mb-2 flex items-center justify-between gap-3` | 下距 8px |
| "推荐标签"文字 | `text-xs text-muted-foreground` | 12px muted |
| 刷新按钮 | `inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors` + `<RefreshCw className="h-3.5 w-3.5" />` | 12px，hover 转 `--foreground`，图标 14px |
| 标签滚动区 | `flex min-h-[168px] max-h-[220px] flex-wrap content-start gap-2 overflow-y-auto pr-1` | 最小高 168px、最大高 220px、纵向滚动、右留 4px |
| 标签按钮（未选） | `text-xs px-2 py-1 rounded cursor-pointer transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground` | 12px、4px 圆角、`--muted` 底、hover 提亮 |
| 标签按钮（已选） | `bg-primary/15 text-primary` | `--primary` 15% 底 + `--primary` 字 |

交互约定：推荐区一次展示 `visibleTagCount = 36` 个（simple-tag-input.tsx:16）；标签总数 ≤36 时全展示，否则按 `${tagPage}-${id}-${index}` 生成种子哈希打分（`score = (score*31 + charCode) % 1000003`）升序排序取前 36（simple-tag-input.tsx:29-45），点"刷新"仅 `tagPage+1` 换一批（simple-tag-input.tsx:82）。已选标签点击无效（`!selected &&`，simple-tag-input.tsx:97）。注意：**已选标签在 chip 区按 `id→name` 映射显示名称**（`tagNameMap.get(tag) || tag`，simple-tag-input.tsx:67），而手动回车录入的自由文本没有 id、直接原样存值；点击推荐加入的是 `t.id`（simple-tag-input.tsx:97）。

### 落地范例：PromptForm 布局约定

来源 `src/features/admin/components/prompt-form.tsx`。

- 表单根：`grid grid-cols-1 md:grid-cols-2 gap-8`（prompt-form.tsx:209），左图右字段，栅格间距 2rem=32px。
- 字段单元统一 `space-y-2`（Label 与控件间 8px）；右列容器 `space-y-6 pb-4`，各字段块间 24px（prompt-form.tsx:356）；左列图片区容器 `space-y-4`=16px（prompt-form.tsx:211）；元数据区内的模型/比例两列用 `grid grid-cols-2 gap-4`（prompt-form.tsx:320）。
- 输入类控件在卡片内一律追加 `className="bg-background"` 覆盖透明底，避免叠在卡片上无边界感。
- 底部提交条 `sticky bottom-0 z-10 pt-4 pb-4 bg-background border-t border-border shadow-lg -mx-2 px-2 mt-auto`（prompt-form.tsx:437），提交按钮 `w-full`，加载时内嵌 `Loader2 w-4 h-4 mr-2 animate-spin`（prompt-form.tsx:445）。

---

<a id="sec-10"></a>

## 10. 卡片 · 徽章 · 标签 · 统计

本章覆盖画廊与列表中最高频复用的四类原子组件：`Card`（容器）、`Badge`（徽章基座）、`TagBadge`/`PopularTags`（标签药丸）、`StatsBadge`（统计数字）以及组合体 `ImageCard`（画廊卡片）。所有颜色 token 取自 `src/app/globals.css`，hex 为近似换算（供全章引用）：

| Token | 亮色 oklch | 近似 hex | 暗色 oklch | 近似 hex | 定义 |
|---|---|---|---|---|---|
| `--card` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.145 0 0)` | `#252525` | globals.css:9 / :45 |
| `--card-foreground` | `oklch(0.145 0 0)` | `#252525` | `oklch(0.985 0 0)` | `#fbfbfb` | :10 / :46 |
| `--primary` | `oklch(0.205 0 0)` | `#343434` | `oklch(0.985 0 0)` | `#fbfbfb` | :13 / :49 |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#fbfbfb` | `oklch(0.205 0 0)` | `#343434` | :14 / :50 |
| `--secondary` | `oklch(0.97 0 0)` | `#f7f7f7` | `oklch(0.269 0 0)` | `#414141` | :15 / :51 |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `#343434` | `oklch(0.985 0 0)` | `#fbfbfb` | :16 / :52 |
| `--muted` | `oklch(0.97 0 0)` | `#f7f7f7` | `oklch(0.269 0 0)` | `#414141` | :17 / :53 |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#8e8e8e` | `oklch(0.708 0 0)` | `#b4b4b4` | :18 / :54 |
| `--accent` | `oklch(0.97 0 0)` | `#f7f7f7` | `oklch(0.269 0 0)` | `#414141` | :19 / :55 |
| `--accent-foreground` | `oklch(0.205 0 0)` | `#343434` | `oklch(0.985 0 0)` | `#fbfbfb` | :20 / :56 |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#e5484a`(红) | `oklch(0.396 0.141 25.723)` | `#8a2a26` | :21 / :57 |
| `--border` | `oklch(0.922 0 0)` | `#ebebeb` | `oklch(0.269 0 0)` | `#414141` | :23 / :59 |
| `--ring` | `oklch(0.708 0 0)` | `#b4b4b4` | `oklch(0.439 0 0)` | `#6f6f6f` | :25 / :61 |

圆角基准（globals.css:31、:104-107）：`--radius: 0.625rem = 10px`；派生 `rounded-sm = calc(radius-4px) = 6px`、`rounded-md = calc(radius-2px) = 8px`、`rounded-lg = radius = 10px`、`rounded-xl = calc(radius+4px) = 14px`；`rounded-full = 9999px`。

> 注意：本项目用 **Tailwind CSS v4**（`@import "tailwindcss"` + `@theme inline`，globals.css:1、:77）。v4 下 `shadow-sm` 的值与 v3 不同，见下方 Card 说明。

---

### 1. Card（容器基座）

来源 `src/shared/ui/card.tsx`。`Card` 是一个带 `data-slot="card"` 的 `div`，默认类名（card.tsx:12）：

```
bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm
```

| 属性 | 类名 | 精确值 |
|---|---|---|
| 背景 | `bg-card` | `var(--card)`（亮 `#ffffff` / 暗 `#252525`） |
| 前景文字 | `text-card-foreground` | `var(--card-foreground)` |
| 布局 | `flex flex-col` | 纵向 flex |
| 子项间距 | `gap-6` | `1.5rem = 24px` |
| 圆角 | `rounded-xl` | `14px`（`--radius + 4px`） |
| 边框 | `border` | `1px` 实线 `var(--border)` |
| 上下内边距 | `py-6` | 上下各 `1.5rem = 24px`（**左右无内边距**，由子槽位补） |
| 阴影 | `shadow-sm` | **Tailwind v4**：`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`（注意不是 v3 的 `0 1px 2px 0 rgb(0 0 0 / 0.05)`，后者在 v4 里叫 `shadow-xs`） |

**结构槽位**（均为 `div`，默认无背景）：

| 组件 | data-slot | 关键类名 | 值 |
|---|---|---|---|
| `CardHeader` | `card-header` | `@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6` | 行间距 `gap-2 = 8px`；左右 `px-6 = 24px`；内含 `card-action` 时切换 `grid-cols-[1fr_auto]`；带 `border-b` 时下 `pb-6 = 24px`（card.tsx:25） |
| `CardTitle` | `card-title` | `leading-none font-semibold` | 行高 1、字重 600（card.tsx:37） |
| `CardDescription` | `card-description` | `text-muted-foreground text-sm` | `0.875rem = 14px`，muted 前景（card.tsx:47） |
| `CardAction` | `card-action` | `col-start-2 row-span-2 row-start-1 self-start justify-self-end` | 右上角操作位，顶部对齐（card.tsx:58） |
| `CardContent` | `card-content` | `px-6` | 左右 `24px`（card.tsx:70） |
| `CardFooter` | `card-footer` | `flex items-center px-6 [.border-t]:pt-6` | 左右 `24px`；带 `border-t` 时上 `pt-6=24px`（card.tsx:80） |

**约定/坑**：`Card` 本体只给了 `py-6` 而无左右内边距，横向内边距由 `CardHeader/Content/Footer` 的 `px-6` 提供。若像 `ImageCard` 那样直接放整幅图，必须用 `p-0` 抵消 `py-6`，否则上下会各多出 24px 白边。

---

### 2. Badge（徽章基座）

来源 `src/shared/ui/badge.tsx`，基于 `cva`。基类（badge.tsx:10）：

```
inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium
w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
transition-[color,box-shadow] overflow-hidden
```

| 属性 | 类名 | 精确值 |
|---|---|---|
| 圆角（基类默认） | `rounded-md` | `8px`（注意：**基类是 md 不是 full**，药丸形由调用方额外加 `rounded-full` 得到） |
| 左右内边距 | `px-2` | `0.5rem = 8px` |
| 上下内边距 | `py-0.5` | `0.125rem = 2px` |
| 字号 | `text-xs` | `0.875rem = 14px`，行高 `1rem = 16px` |
| 字重 | `font-medium` | 500 |
| 图标尺寸 | `[&>svg]:size-3` | `0.875rem = 14px` |
| 图标/文字间距 | `gap-1` | `0.25rem = 4px` |
| 边框 | `border` | `1px` |
| 聚焦环 | `focus-visible:ring-[3px]` | `3px`，色 `ring-ring/50`（`--ring` 50% 透明） |
| 过渡 | `transition-[color,box-shadow]` | 仅色与阴影 |
| 溢出 | `overflow-hidden` | 裁切 |

**变体表**（badge.tsx:14-21）：

| variant | 背景 | 文字 | 边框 | hover（仅 `[a&]:`，即包在 `<a>` 内时） |
|---|---|---|---|---|
| `default`（默认） | `bg-primary` | `text-primary-foreground` | `border-transparent` | `hover:bg-primary/90` |
| `secondary` | `bg-secondary` | `text-secondary-foreground` | `border-transparent` | `hover:bg-secondary/90` |
| `destructive` | `bg-destructive` | `text-white`（固定白，非 token） | `border-transparent` | `hover:bg-destructive/90`；暗色底 `dark:bg-destructive/60`；聚焦环 `focus-visible:ring-destructive/20`，暗色 `dark:focus-visible:ring-destructive/40` |
| `outline` | 透明 | `text-foreground` | `border`（默认 `--border`） | `hover:bg-accent hover:text-accent-foreground` |

**约定/坑**：
- hover 样式带 `[a&]:` 前缀，**只有当 Badge 被 `asChild` 或外层包 `<a>`/`Link` 时才生效**；裸 Badge 无 hover。`TagBadge`/`PopularTags` 正是靠外层 `Link` 触发，但它们又各自手写了 `hover:bg-accent` 覆盖（见下）。
- `destructive` 文字是硬编码 `text-white`，不随主题反转；放在浅底浮层里不要再叠加深色文字类。
- 渲染标签是 `<span>`（badge.tsx:37，默认 `Comp = 'span'`），非 `<div>`，可安全内联在文本流中；`asChild` 时替换为 Radix `Slot`。

---

### 3. TagBadge / TagList（标签药丸）

来源 `src/features/tags/components/tag-badge.tsx`。基于 `Badge variant="secondary"`，追加尺寸与色片。

**尺寸表**（tag-badge.tsx:9-12）：

| size | 类名 | 字号 | 左右内边距 | 上下内边距 |
|---|---|---|---|---|
| `sm`（默认） | `text-xs px-2 py-0.5` | `12px` | `8px` | `2px` |
| `md` | `text-sm px-3 py-1` | `14px` | `0.875rem = 14px` | `0.25rem = 4px` |

**色片规则**（tag-badge.tsx:35）：内联样式 `backgroundColor = tag.color ? \`${tag.color}20\` : undefined`。即在标签自定义色后拼接十六进制透明度后缀 `20`（= `0x20/0xFF ≈ 12.5%` 不透明度），得到一层极淡的品牌色底。`tag.color` 为空时不设内联背景，回退到 `secondary` 的 `bg-secondary`。

**交互**：
- `clickable=true`（默认）时追加 `hover:bg-accent cursor-pointer`（tag-badge.tsx:34），并用 `Link href="/?tag=${slug}" prefetch={false}` 包裹（tag-badge.tsx:41-47）。
- `handleTagNavigation`（tag-badge.tsx:23-29）：首页（`pathname === "/"`）点击走 `event.preventDefault()` + `window.history.pushState` 原地筛选并 `scrollTo` 平滑滚顶；非首页直接 `return`，让 `Link` 正常跳转。

**约定/坑**：内联 `backgroundColor` 优先级高于 `bg-secondary`，但 `hover:bg-accent` 是类名，在有内联背景时**内联样式会盖住 hover 类**（内联样式始终胜出），因此设置了 `tag.color` 的标签实际 hover 不变色。若要让 hover 生效，需改用 CSS 变量注入而非内联 backgroundColor。

**TagList**（tag-badge.tsx:59-75）：容器 `flex flex-wrap gap-1.5`（间距 `0.375rem = 6px`，tag-badge.tsx:64）。`limit` 截断后若有剩余，追加一枚 `Badge variant="outline"` 显示 `+N`（tag-badge.tsx:69），其内边距沿用 `sizeClasses[size]`。

---

### 4. PopularTags（热门标签药丸）

来源 `src/features/gallery/components/popular-tags.tsx`。统计各标签在 `prompts` 中出现次数并按次数降序，取前 `limit`（默认 12，popular-tags.tsx:16）。`popularTags.length === 0` 时整体返回 `null`（popular-tags.tsx:35）。

| 部位 | 类名 | 精确值 |
|---|---|---|
| 外层容器 | `flex flex-wrap items-center justify-center gap-2`（popular-tags.tsx:47） | 居中换行，间距 `0.5rem = 8px` |
| 前缀文字「热门标签」 | `text-xs text-muted-foreground`（:48） | `12px`，muted |
| 药丸 Badge | `variant="secondary"` + `rounded-full px-3 py-1 text-xs hover:bg-accent transition-colors`（:58） | 全圆角 `9999px`；左右 `12px`、上下 `4px`；字号 `12px` |
| 药丸底色 | 内联 `backgroundColor: tag.color ? \`${tag.color}20\` : undefined`（:59） | 同 TagBadge 的 12.5% 品牌色 |
| 计数后缀 | `ml-1 text-muted-foreground`（:62） | 左 `4px`，muted 数字 |

外层包 `Link href="/?tag=${slug}" prefetch={false}`（popular-tags.tsx:50-55），首页点击同样走 `handleTagNavigation`（:37-44）做 `pushState` 原地筛选 + 平滑滚顶。

**与 TagBadge 的差异**：这里**显式 `rounded-full`** 覆盖 Badge 基类的 `rounded-md`，做成完整药丸；而 `TagBadge` 未覆盖，保持 `rounded-md = 8px`。二者不要混淆——列表页标签是圆角矩形，首页热门标签是全圆药丸。同样存在内联背景压制 `hover:bg-accent` 的坑。

---

### 5. StatsBadge（统计数字）

来源 `src/features/stats/components/stats-badge.tsx`。展示浏览/复制/点赞三组「图标+数字」。

| 部位 | 类名 | 精确值 |
|---|---|---|
| 外层容器 | `flex items-center gap-3 text-sm`（:25） | 组间距 `0.875rem = 14px`；字号 `14px`；额外拼接传入 `className` |
| 单组容器 | `flex items-center gap-1 text-muted-foreground`（:27/:34/:41） | 图标与数字间 `4px`；整组 muted 前景 |
| 图标 | `h-3.5 w-3.5`（:28/:35/:42） | `0.875rem = 14px` |
| 可选中文标签 | `hidden sm:inline`（:30/:37/:44） | 默认隐藏，`sm`（≥640px）起显示；仅当 `showLabel=true` |

图标映射（stats-badge.tsx:3）：浏览 = `Eye`，复制 = `Copy`（导入别名 `CopyIcon`），点赞 = `Heart`（`lucide-react`）。三个字段 `views/copies/likes` 均为可选，`undefined` 时该组不渲染（各组以 `xxx !== undefined` 守卫）。

**`formatNumber` 数字缩写规则**（stats-badge.tsx:14-22，中文语境用「w」= 万）：

| 输入区间 | 输出 | 示例 |
|---|---|---|
| `num >= 10000` | `(num/10000).toFixed(1) + "w"` | `12345 → "1.2w"` |
| `1000 <= num < 10000` | `(num/1000).toFixed(1) + "k"` | `1500 → "1.5k"` |
| `num < 1000` | `num.toString()` | `999 → "999"` |

**约定**：新增任何展示统计数字的位置都应复用 `StatsBadge` 或其 `formatNumber` 规则，保持「k / w」缩写一致，不要各自实现 `toLocaleString`。

---

### 6. ImageCard（画廊卡片，组合体）

来源 `src/features/gallery/components/image-card.tsx`。以 `Card` 为壳，内部是「比例占位 + 图片 + 加载态 + 错误兜底 + 浏览量徽章」。

**卡片壳**（image-card.tsx:31）：

```
group overflow-hidden border-border/50 bg-card hover:border-accent/50
transition-all duration-300 cursor-pointer rounded-lg p-0
```

| 属性 | 类名 | 精确值 / 说明 |
|---|---|---|
| 分组钩子 | `group` | 供子元素 `group-hover:` 用 |
| 裁切 | `overflow-hidden` | 让图片圆角与缩放不溢出 |
| 边框 | `border-border/50` | `1px`，色为 `--border` 的 50% 透明 |
| hover 边框 | `hover:border-accent/50` | 悬停变 `--accent` 50% 透明 |
| 背景 | `bg-card` | `var(--card)` |
| 过渡 | `transition-all duration-300` | 300ms 全属性 |
| 圆角 | `rounded-lg` | `10px`（覆盖 Card 基类的 `rounded-xl = 14px`） |
| 内边距 | `p-0` | **归零 Card 基类 `py-6`**，图片贴边 |
| 光标 | `cursor-pointer` | 整卡可点，`onClick=onCardClick` |

**比例预留**（image-card.tsx:20-22、34）：读 `prompt.metadata?.aspectRatio`，若含 `":"` 则把 `"3:4"` 转为 CSS `"3 / 4"` 写入内联 `style.aspectRatio`，用于提前占位、减少布局抖动；无比例时 `ratio = undefined`，走图片自然高度分支。

**加载 shimmer**（image-card.tsx:35-37）：`!loaded && !failed` 时叠一层占位：

```
absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-muted via-muted/70 to-background
```

`animate-pulse`（透明度 0.5↔1 循环，默认 2s），渐变从 `--muted` → `--muted/70` → `--background`，`z-10` 压在图片之上、徽章之下。

**图片**（两分支，image-card.tsx:46-70）：均用 `next/image`，`loading="lazy"`，`sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`；有比例分支用 `fill` + `object-cover`，无比例分支用 `width={0} height={0}` + `w-full h-auto block` 且内联 `style={{ width:'100%', height:'auto' }}`；两分支共有 `transition-all duration-300 group-hover:scale-105`（悬停放大到 **1.05**）与 `loaded ? "opacity-100" : "opacity-0"`（加载完成才淡入）。`onLoad` 置 `loaded=true`，`onError` 走 `handleError`。

**错误兜底**（image-card.tsx:24-27、39-45）：`handleError` 同时置 `failed=true` 且 `loaded=true`（关掉 shimmer）。渲染占位：

```
flex flex-col items-center justify-center gap-2 bg-muted/40 p-4 text-center text-muted-foreground
```

有比例时追加 `absolute inset-0` 铺满，无比例时追加 `min-h-[160px] w-full`（最小高 `160px`）。内含 `ImageOff` 图标 `h-6 w-6`（`1.5rem = 24px`）与 `line-clamp-2 text-xs` 的标题（12px，最多两行）。

**右上角浏览量徽章**（image-card.tsx:72-75）：

```
absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1
text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 z-20
```

| 属性 | 值 |
|---|---|
| 定位 | 距右/上各 `right-2 top-2 = 0.5rem = 8px` |
| 圆角 | `rounded-full = 9999px`（药丸） |
| 背景 | `bg-black/60`（纯黑 60% 不透明）+ `backdrop-blur`（默认 `blur(8px)`） |
| 内边距 | `px-2 py-1` = 左右 `8px`、上下 `4px` |
| 文字 | `text-xs font-medium text-white`（12px / 500 / 白） |
| 图标 | `Eye` `h-3.5 w-3.5 = 14px`，图标与数字 `gap-1 = 4px` |
| 显隐 | 默认 `opacity-0`，`group-hover:opacity-100`（悬停淡入），`transition-opacity` |
| 层级 | `z-20`（压在 shimmer `z-10` 之上） |
| 数值 | `prompt.views || 0`（**此处不走 `formatNumber`**，直接原始数字） |

**约定/坑**：
- 该浏览量徽章用 `bg-black/60` + `text-white` 固定深底白字，与 `StatsBadge` 的 muted 文字体系不同；这是叠图浮层的专用配色，**不要**在此处套 `text-muted-foreground`（图上会看不清）。它显示的是未缩写的原始 `views`，与列表处 `StatsBadge` 的「k/w」缩写行为不一致，属已知差异。
- `ImageCard` 必须保留 `rounded-lg p-0`：`p-0` 抵消 `Card` 的 `py-6`，`rounded-lg` 降一档圆角以贴合画廊瀑布流密度；改动前需同步保留壳上的 `overflow-hidden` 才能维持图片圆角裁切。

---

<a id="sec-11"></a>

## 11. 导航与侧边栏

本章覆盖前台桌面侧边栏（`Sidebar`）、前台移动端侧边栏与顶栏（`MobileSidebar` + Mobile Header）、后台侧边栏（`AdminSidebar`）与独立主题切换按钮（`ThemeToggle`）。所有类名/尺寸/颜色均取自源码实测值。

> 两套**实体**侧边栏（前台桌面 `Sidebar`、后台 `AdminSidebar`）共享同一外壳骨架：`fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar`，结构几乎一致。移动端不使用该骨架，而是 Radix `Sheet` 浮层（`bg-background`），色彩因此改走通用 `accent` 色板（详见「浮层里的继承坑」）。

### 1. 布局装配（LayoutWrapper）

来源：`src/features/shell/components/layout-wrapper.tsx`

- 路由判定：`pathname?.startsWith("/admin")` 为真时直接 `return <>{children}</>`，**前台侧边栏不渲染**，后台由自己的 layout 挂 `AdminSidebar`（layout-wrapper.tsx:18-22）。
- 桌面侧边栏容器：`hidden lg:block`（仅 `lg` ≥ 1024px 显示）包裹 `<Sidebar>`（layout-wrapper.tsx:27-29）。
- 移动端顶栏（Mobile Header，layout-wrapper.tsx:32-35）：

| 属性 | 类名 | 实测值 |
| --- | --- | --- |
| 定位 | `fixed top-0 left-0 right-0` | 贴顶通栏 |
| 层级 | `z-50` | 高于侧边栏 `z-40` |
| 布局 | `flex items-center justify-between` | 左菜单按钮 + 右主题切换 |
| 高度 | `h-16` | 4rem = 64px |
| 横向内边距 | `px-4` | 1rem = 16px |
| 下边框 | `border-b border-border/40` | 1px，`--border` 透明度 40% |
| 背景 | `bg-background/95` | `--background` 95% 不透明 |
| 毛玻璃 | `backdrop-blur supports-[backdrop-filter]:bg-background/60` | 支持 backdrop-filter 时背景降到 60%（`backdrop-blur` = `blur(8px)`） |
| 可见性 | `lg:hidden` | 仅 < 1024px 显示 |

- 主内容偏移（layout-wrapper.tsx:38）：`lg:ml-64 min-h-screen pt-16 lg:pt-0`。桌面左移 `16rem = 256px` 让开侧边栏；移动端 `pt-16 = 4rem = 64px` 让开顶栏，桌面 `lg:pt-0` 归零。
- **规则**：新增全站顶部固定元素必须遵守此 z 轴分层——顶栏 `z-50` > 侧边栏 `z-40`；页面内浮层需高于二者。任何主内容区的根容器都应复用 `lg:ml-64 pt-16 lg:pt-0` 这套偏移，否则会被侧边栏/顶栏遮挡。

### 2. 侧边栏外壳与色彩变量

外壳类名（sidebar.tsx:105、admin-sidebar.tsx:58）：
```
fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-sidebar
```

| 属性 | 类名 | 实测值 |
| --- | --- | --- |
| 宽度 | `w-64` | 16rem = 256px |
| 高度 | `h-screen` | 100vh |
| 右边框 | `border-r border-border/40` | 1px，颜色 `--border` @ 40% 透明度 |
| 背景 | `bg-sidebar` | 见下表 `--sidebar` |
| 内部布局 | `flex h-full flex-col` | 纵向：Logo / 分隔线 / 搜索 / 滚动区 / 底部操作 |

侧边栏专用 CSS 变量（`src/app/globals.css:32-39` 浅色、`67-74` 深色；`@theme inline` 映射 `108-115`）。注意 hex 为 oklch 灰阶的**正确近似值**（由 oklch 亮度反解到 sRGB，而非把亮度数字乘 255）：

| 变量 | 浅色 oklch | 近似 hex | 深色 oklch | 近似 hex | 用途 |
| --- | --- | --- | --- | --- | --- |
| `--sidebar` | `oklch(0.985 0 0)` | `#fafafa` | `oklch(0.205 0 0)` | `#171717` | 侧边栏背景 |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `#0a0a0a` | `oklch(0.985 0 0)` | `#fafafa` | 侧边栏文字 |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `#f5f5f5` | `oklch(0.269 0 0)` | `#262626` | 激活/悬停底色 |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `#171717` | `oklch(0.985 0 0)` | `#fafafa` | 激活项文字 |
| `--sidebar-border` | `oklch(0.922 0 0)` | `#e5e5e5` | `oklch(0.269 0 0)` | `#262626` | 内部分隔线/底部边框 |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `#a1a1a1` | `oklch(0.439 0 0)` | `#525252` | 焦点环 |

辅助变量（同文件）：`--border` 浅 `oklch(0.922 0 0)`≈`#e5e5e5` / 深 `oklch(0.269 0 0)`≈`#262626`；`--background` 浅 `oklch(1 0 0)`=`#ffffff` / 深 `oklch(0.145 0 0)`≈`#0a0a0a`；`--muted-foreground` 浅 `oklch(0.556 0 0)`≈`#737373` / 深 `oklch(0.708 0 0)`≈`#a1a1a1`；`--accent` 浅 `oklch(0.97 0 0)`≈`#f5f5f5` / 深 `oklch(0.269 0 0)`≈`#262626`。全局圆角基准 `--radius: 0.625rem`（globals.css:31）。

### 3. 顶部品牌区

来源：sidebar.tsx:108-120、mobile-sidebar.tsx:117-129、admin-sidebar.tsx:60-67

| 元素 | 类名 | 实测值 |
| --- | --- | --- |
| 容器 | `flex h-16 items-center px-6` | 高 4rem=64px，左右内边距 `px-6`=1.5rem=24px |
| 链接 | `flex items-center space-x-2` | 图标与文字间距 0.5rem=8px |
| 渐变方块 | `h-8 w-8 rounded-lg` | 2rem=32px 正方形，圆角 `rounded-lg`=`--radius-lg`=`--radius`=0.625rem=10px |
| 方块渐变 | `bg-gradient-to-br from-white via-slate-200 to-cyan-100` | 左上→右下：`#ffffff` → `#e2e8f0` → `#cffafe` |
| 方块阴影 | `shadow-sm` | Tailwind v4：`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| 方块描边 | `ring-1 ring-slate-300/70` | 1px 环，`#cbd5e1` @ 70% |
| 方块内居中 | `flex items-center justify-center` | — |
| 品牌图标 | `Sparkles h-5 w-5 text-slate-900` | 1.25rem=20px，色 `#0f172a`（前台/移动端）；后台改为字母「N」`font-bold text-slate-900 text-lg` |
| 站名 | `font-bold text-lg text-sidebar-foreground` | 700 字重，1.125rem=18px；前台文本取 `siteName`，后台取 `settings.site.adminName` |

> 阴影校正：`shadow-sm` 在 Tailwind v4 下已升级为原 v3 的 `shadow` 值（双层阴影，见上表）；原 v3 的 `shadow-sm`（`0 1px 2px 0 rgb(0 0 0 / 0.05)`）在 v4 中改名为 `shadow-xs`（正是搜索按钮 `outline` 变体用的那个）。

注意：移动端站名少了 `text-sidebar-foreground`（mobile-sidebar.tsx:127，仅 `font-bold text-lg`），因为 Sheet 面板背景是 `bg-background` 而非 `bg-sidebar`，文字继承 `--foreground`（见第 8 节）。

品牌区下方统一接 `<Separator>` 分隔线（sidebar.tsx:122 / admin-sidebar.tsx:69 均带 `bg-sidebar-border`；移动端 mobile-sidebar.tsx:131 为裸 `<Separator>` 用默认 `bg-border`）。

### 4. 搜索按钮（仅前台）

来源：sidebar.tsx:125-135、mobile-sidebar.tsx:134-143

- 外层容器：`px-4 py-4`（1rem 内边距）。
- 按钮：`variant="outline"`，`className="w-full justify-start text-muted-foreground hover:text-foreground"`。
  - 桌面版额外加 `border-sidebar-border hover:bg-sidebar-accent`（sidebar.tsx:129），使描边与悬停底色贴合侧边栏色板。
  - 移动版无这两条覆盖，走 `outline` 默认的 `hover:bg-accent`。
- `outline` 变体基线（button.tsx:17-18）：`border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`，暗色 `dark:bg-input/30 dark:border-input dark:hover:bg-input/50`。
- 尺寸 = Button `default`：`h-9 px-4 py-2 has-[>svg]:px-3` → 高 2.25rem=36px；因含 svg，横向 padding 实为 `px-3`=0.75rem=12px。
- 图标 `Search mr-2 h-4 w-4`：1rem=16px，右侧间距 0.5rem=8px；文案「搜索...」。

### 5. 导航区与条目规范

导航分组标题（sidebar.tsx:140-142 / mobile-sidebar.tsx:149-151 / admin-sidebar.tsx:73-75）：
```
px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2
```
= 内边距 0.5rem、字号 0.75rem=12px、600 字重、`uppercase`、字距 `tracking-wide`=0.025em、下边距 `mb-2`=0.5rem，颜色 `--muted-foreground`。前台文案「导航」，后台「管理」。

条目列表容器：`space-y-1`（条目间距 0.25rem=4px）+ `py-2`。滚动区包一层 `<ScrollArea className="flex-1 px-4">`（前台，sidebar.tsx:137），后台用 `<nav className="flex-1 px-4 py-4">`（admin-sidebar.tsx:71）。横向内边距统一 `px-4`=1rem=16px。

导航条目按钮（`variant` 由激活态决定）：

| 状态 | variant | 附加类名 | 说明 |
| --- | --- | --- | --- |
| 激活（桌面/后台） | `secondary` | `bg-sidebar-accent text-sidebar-accent-foreground font-medium` | 底色 `--sidebar-accent`，文字 `--sidebar-accent-foreground`，500 字重 |
| 非激活（桌面/后台） | `ghost` | `text-sidebar-foreground hover:bg-sidebar-accent/50` | 悬停底色 = `--sidebar-accent` @ 50% |
| 激活（移动端） | `secondary` | `bg-accent text-accent-foreground font-medium` | 用通用 `--accent`（非 sidebar 色板） |
| 非激活（移动端） | `ghost` | `hover:bg-accent/50` | 无显式文字色，继承 `--foreground` |

所有导航按钮共用 `w-full justify-start`（撑满宽、左对齐）。前台顶级导航项（「全部」，Sparkles 图标）与**后台主导航项均未传 `size`**，即用 Button `default` 尺寸（h-9=36px）；分类项与后台底部操作项才显式 `size="sm"`（h-8=32px）。图标统一 `mr-2 h-4 w-4`（16px + 右间距 8px）。

前台顶级导航仅一项：`{ label: "全部", href: "/", icon: Sparkles }`（sidebar.tsx:79-81）。

后台导航项（admin-sidebar.tsx:31-38，图标来自 lucide-react）：

| 文案 | href | 图标 |
| --- | --- | --- |
| 概览 | `/admin` | `LayoutDashboard` |
| 新建 Prompt | `/admin/upload` | `Plus` |
| 标签管理 | `/admin/tags` | `Tags` |
| 分类管理 | `/admin/categories` | `FolderTree` |
| 站点设置 | `/admin/settings` | `Settings` |
| 系统诊断 | `/admin/health` | `Activity` |

后台激活判定为**精确匹配** `pathname === item.href`（admin-sidebar.tsx:78）。前台 `isActive()` 更复杂（sidebar.tsx:61-77）：`/` 首页需同时无 `category` 与 `tag` 参数才算激活；`pathname !== "/"` 时首页项直接判非激活；带 `?period=` 的项比对 `period` 参数。

**Button 基线尺寸参考**（button.tsx:25-32，供本章所有按钮换算）：

| size | 类名 | 高度 | 备注 |
| --- | --- | --- | --- |
| `default` | `h-9 px-4 py-2 has-[>svg]:px-3` | 2.25rem=36px | 含 svg 时 px-3=12px |
| `sm` | `h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5` | 2rem=32px | 含 svg 时 px-2.5=10px，图标间距 gap-1.5=6px |
| `icon` | `size-9` | 2.25rem=36px | 正方形 |

Button 基础样式（button.tsx:10）：`rounded-md`（=`--radius-md`=`calc(0.625rem - 2px)`=0.5rem=8px）、`text-sm`（0.875rem=14px）、`font-medium`、`transition-all`、`disabled:opacity-50`；焦点环 `focus-visible:ring-ring/50 focus-visible:ring-[3px]`（3px）；内联 svg 默认 `size-4`（16px）。

### 6. 分类折叠区

来源：sidebar.tsx:172-213、mobile-sidebar.tsx:181-226

- 折叠区上方有分隔线：`<Separator className="my-4 bg-sidebar-border" />`（桌面，sidebar.tsx:169）/ `my-4`（移动端裸 Separator，mobile-sidebar.tsx:178）。`my-4`=上下 1rem。
- 折叠触发按钮（原生 `<button>`）：
  ```
  flex w-full items-center justify-between px-2 py-1 text-xs font-semibold
  text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors
  ```
  左侧文案「分类」，右侧 `ChevronDown h-4 w-4`。
- 箭头旋转（sidebar.tsx:178-183）：`transition-transform` + 展开时 `transform rotate-180`（180°），收起时无旋转。默认 `categoriesExpanded = true`（初始展开，箭头朝上）。
- 展开内容：`mt-2 space-y-1`；每个分类为 `size="sm"` 的 Button，`w-full justify-start text-sm`，激活/非激活配色同第 5 节表格（桌面用 sidebar 色板，移动端用 accent 色板）。
- 数据：`getAllCategories(rawCategories)`，`category.slug` 与 URL `?category=` 比对决定 `isSelected`。

**首页原地筛选规则**（`handleHomeFilterNavigation`，sidebar.tsx:83-89 / mobile-sidebar.tsx:76-90）：当 `pathname === "/"` 时，点击导航/分类**不走路由跳转**，而是 `event.preventDefault()` + `window.history.pushState` 改 URL + `window.scrollTo({ top: 0, behavior: "smooth" })` 平滑回顶；移动端还会通过 `afterNavigate` 回调 `setOpen(false)` 关闭 Sheet（非首页时移动端仅执行 `afterNavigate` 关面板并放行正常跳转）。新增首页筛选入口必须复用此函数，否则会触发整页刷新、丢失滚动位置。

### 7. 底部操作区

来源：sidebar.tsx:216-268、admin-sidebar.tsx:100-137、mobile-sidebar.tsx:229-269

容器：`border-t border-sidebar-border p-4 space-y-2`（桌面/后台）；移动端为 `border-t p-4 space-y-2`（裸 `border-t` 用默认 `--border`）。`p-4`=1rem，条目间距 `space-y-2`=0.5rem。所有按钮 `size="sm"`（h-8=32px）+ `w-full justify-start`。

| 按钮 | 出现位置 | 图标 | className |
| --- | --- | --- | --- |
| 进入后台 | 前台（登录后）/移动端（登录后） | `LayoutDashboard` | 桌面 `text-sidebar-foreground hover:bg-sidebar-accent/50`；移动端仅 `w-full justify-start` |
| 返回主页 | 后台 | `Home` | `text-sidebar-foreground hover:bg-sidebar-accent/50` |
| 切换主题 | 前台/后台（移动端无，改用顶栏 `ThemeToggle`） | `Sun`/`Moon` | `text-sidebar-foreground hover:bg-sidebar-accent/50` |
| 登录 | 前台（未登录） | `User` | 桌面 `text-sidebar-foreground`（无 hover 底色覆盖）；移动端仅 `w-full justify-start` |
| 退出登录 | 前台/后台（登录后） | `User`（前台）/ `LogOut`（后台） | 见下 |

**退出登录（红色危险态）**：

- 桌面前台 & 后台（sidebar.tsx:249、admin-sidebar.tsx:129）：`text-red-500 hover:text-red-600 hover:bg-red-500/10`
  - `text-red-500`=`#ef4444`，`hover:text-red-600`=`#dc2626`，悬停底色 `red-500` @ 10%。
- 移动端（mobile-sidebar.tsx:246）：`text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20`（悬停底色浅色 `#fee2e2`、深色 `red-900`（`#7f1d1d`）@ 20%）。
- 加载态：`disabled={loggingOut}`，文案在「退出登录」↔「退出中...」间切换。

**退出二次确认（AlertDialog）**：点击退出按钮先 `setShowLogoutConfirm(true)` 弹确认框，不直接登出。确认动作按钮统一红色：`bg-red-500 hover:bg-red-600 focus:ring-red-500`（sidebar.tsx:285 / mobile-sidebar.tsx:287 / admin-sidebar.tsx:152）。确认后 `handleLogout()` → `POST /api/auth/logout` → `window.location.href = "/"`。前台描述「您将退出当前账户。」，后台「您将退出管理后台。」。

**内嵌主题切换（侧边栏内，非独立 ThemeToggle）**：sidebar.tsx:232-244 / admin-sidebar.tsx:113-125。带 `mounted` 守卫：`{mounted && theme === "dark" ? <Sun/> : <Moon/>}`——未挂载或非暗色时显示 `Moon`，暗色时显示 `Sun`，避免 SSR 水合不一致。图标 `mr-2 h-4 w-4`，点击 `setTheme(theme === "dark" ? "light" : "dark")`。

### 8. 移动端 Sheet 与「浮层里的继承坑」

来源：mobile-sidebar.tsx:107-113、`src/shared/ui/sheet.tsx`

- 触发器：`SheetTrigger` 包 `Button variant="ghost" size="icon" className="lg:hidden"`，内含 `Menu h-5 w-5`（1.25rem=20px）。`size="icon"`=`size-9`=36px 正方形。
- Suspense fallback：同款按钮但图标 `opacity-50`（mobile-sidebar.tsx:301-303）。
- 面板：`<SheetContent side="left" className="w-64 p-0">` → 宽 `w-64`=256px（覆盖 Sheet 默认的 `w-3/4 sm:max-w-sm`），`p-0` 去内边距由内部自管。
- Sheet 底层样式（sheet.tsx）：遮罩 `bg-black/50`（50% 黑）+ `fade-in/out`（sheet.tsx:39）；面板 `bg-background ... flex flex-col gap-4 shadow-lg`（sheet.tsx:61），`side=left` 时 `inset-y-0 left-0 h-full border-r`（sheet.tsx:65）；进出动画 `slide-in-from-left`/`slide-out-to-left`，`data-[state=open]:duration-500`（500ms 进）/`data-[state=closed]:duration-300`（300ms 出），`ease-in-out`。自带关闭按钮在 `absolute top-4 right-4`（`XIcon size-4`，sheet.tsx:75-78）。
- 无障碍：`<SheetTitle className="sr-only">{siteName}</SheetTitle>`（mobile-sidebar.tsx:115）——视觉隐藏但供屏幕阅读器，满足 Radix Dialog 必须有标题的约束。

**⚠️ 浮层里按钮文字色的继承坑（必须遵守）**：

移动端 Sheet 面板背景是 `bg-background`（`--background`），**不是** `bg-sidebar`。因此在移动端侧边栏里，激活/悬停必须用通用色板 `bg-accent / text-accent-foreground / hover:bg-accent/50`（mobile-sidebar.tsx:166-167、215-216），而**不能**照搬桌面的 `bg-sidebar-accent / text-sidebar-foreground`。同理品牌站名去掉了 `text-sidebar-foreground`（让它继承 `--foreground`），底部登录/进入后台按钮也不加 `text-sidebar-foreground`（仅 `w-full justify-start`）。

规则：凡是渲染在 `bg-background` 浮层（Sheet / Dialog / Popover）内部的导航按钮，一律使用 `accent` 系列而非 `sidebar` 系列变量；反过来在 `bg-sidebar` 实体侧边栏内则用 `sidebar` 系列。混用会导致激活项底色与文字色对不上（例如深色下 `text-sidebar-foreground` 叠在 `bg-background` 上仍能读，但悬停 `bg-sidebar-accent` 会与面板背景脱节）。

### 9. 独立主题切换按钮（ThemeToggle）

来源：`src/features/shell/components/theme-toggle.tsx`，仅用于移动端顶栏（layout-wrapper.tsx:34）。

- 按钮：`variant="ghost" size="icon" className="h-9 w-9"`（显式 36×36px，与 `size="icon"` 一致）。
- **水合守卫**：`mounted` 为 false 时（首帧/SSR）渲染占位——同款按钮内放一个空 `div h-5 w-5`（不显示任何图标），`mounted` 后才渲染真实 `Sun`/`Moon`（theme-toggle.tsx:17-23）。这是避免 `next-themes` 首屏图标闪烁/水合不匹配的标准做法。
- 图标：暗色 `Sun`、否则 `Moon`，均 `h-5 w-5 transition-all`（20px）；含 `<span className="sr-only">切换主题</span>` 供无障碍。
- 点击：`setTheme(theme === "dark" ? "light" : "dark")`。

**规则**：任何依赖当前主题决定渲染内容的组件，都必须像 `ThemeToggle`（`mounted` 占位）或侧边栏内嵌切换（`mounted && theme === "dark"` 短路）一样加挂载守卫，禁止在首帧直接读 `theme` 渲染分支图标/文案。

---

<a id="sec-12"></a>

## 12. 画廊 · 图片弹窗 · 动效 · 通知

本章覆盖首页瀑布流画廊、图片详情弹窗（Modal）、全局动效约定与 Toast 通知系统，以及排行页所用的 Tabs 组件。所有类名、尺寸、颜色均取自源码实值，改动样式时以本章为准。

---

### 1. 瀑布流画廊（Masonry, JS 分列）

来源：`src/features/gallery/components/client-gallery.tsx`。画廊**不使用 CSS column，而是用 JS 计算列数后手动分配**，以保证卡片按索引取模落列、顺序可控。

#### 1.1 响应式列数（JS 断点，非 Tailwind 断点）

列数由 `window.innerWidth` 在 `resize` 事件中实时计算（`client-gallery.tsx:123-133`），初始 state 为 `2`（`:121`）：

| 视口宽度 | 列数 `columns` | 来源 |
| --- | --- | --- |
| `>= 1280px` | 4 | `client-gallery.tsx:125` |
| `1024px ~ 1279px`（`>= 1024`） | 3 | `client-gallery.tsx:126` |
| `< 1024px` | 2 | `client-gallery.tsx:127`（else 分支） |

规则：这些是**纯 JS 阈值**，与 Tailwind 的 `lg`(1024) / `xl`(1280) 数值一致但由 JS 判定。新增断点必须同时改这里的 `updateColumns`，不能只加 Tailwind 类。

分配算法（`:136-139`）：`columnPrompts[index % columns].push(prompt)`，即按显示顺序轮流入列。

#### 1.2 网格容器与列结构

```jsx
{/* 外层：横向 flex，列间距 gap-2，顶部对齐 */}
<div className="flex gap-2 items-start">
  {/* 每一列：纵向 flex，卡片间距 gap-2，等宽可收缩 */}
  <div className="flex flex-col gap-2 flex-1 min-w-0"> ... </div>
</div>
```
来源：`client-gallery.tsx:196-198`。

| 部件 | 关键类 | 值 | 说明 |
| --- | --- | --- | --- |
| 外层容器 | `flex gap-2 items-start` | gap = `0.5rem` = 8px | 列与列横向间距 |
| 单列 | `flex flex-col gap-2 flex-1 min-w-0` | gap = `0.5rem` = 8px | 卡片纵向间距；`flex-1` 均分宽度；`min-w-0` 防止图片撑破列 |
| 页面主区 | `w-full max-w-[2400px] mx-auto px-3 py-6` | max 2400px；px = `0.75rem` = 12px；py = `1.5rem` = 24px | `client-gallery.tsx:143` |

Hero 区标题（`:146`）：`text-3xl md:text-5xl font-bold`，渐变 `bg-gradient-to-r from-slate-900 via-slate-500 to-cyan-500`（暗色 `dark:from-white dark:via-slate-200 dark:to-cyan-100`）+ `bg-clip-text text-transparent`。统计胶囊（`:153`）：`px-3 py-1 rounded-full bg-accent/50 dark:bg-accent/20`。

> 排行页（`src/app/top/page.tsx:92,95`）复用了完全相同的主区容器与标题渐变类，改标题渐变务必两处同步。

#### 1.3 无限滚动（IntersectionObserver）

来源：`client-gallery.tsx:210-234`。哨兵元素仅在 `paginatedData.hasMore` 时渲染，通过 `ref` 回调即时创建 observer：

| 参数 | 值 | 来源 |
| --- | --- | --- |
| `threshold` | `0.1` | `:222` |
| `rootMargin` | `'100px'`（提前 100px 触发加载） | `:222` |
| 触发动作 | `handleLoadMore()` → `page + 1` | `:219`, `:93-95` |
| 每页条数 `pageSize` | `12` | `:34` |
| 累积渲染 | `sortedPrompts.slice(0, page * pageSize)` | `:98` |

哨兵容器：`h-20 flex items-center justify-center mt-8 w-full`（`h-20` = 5rem = 80px；`mt-8` = 2rem = 32px，`:213`）。

#### 1.4 加载态旋转圈

```html
<div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
<span class="text-sm">正在加载更多...</span>
```
来源：`client-gallery.tsx:230-231`。

| 属性 | 值 |
| --- | --- |
| 尺寸 | `h-6 w-6` = 1.5rem = 24px |
| 边框宽 | `border-2` = 2px |
| 环色 | `border-primary`（亮色 `oklch(0.205 0 0)` ≈ `#343434`；暗色 `oklch(0.985 0 0)` ≈ `#fafafa`） |
| 缺口 | `border-t-transparent`（顶边透明形成旋转缺口） |
| 动画 | `animate-spin`（1s linear 无限旋转） |

空态（`:237-239`）：`text-center py-20`（py = 5rem = 80px）+ `text-muted-foreground` 文案「暂无作品」。

#### 1.5 卡片动效（image-card）

来源：`src/features/gallery/components/image-card.tsx`。

| 元素 | 类 | 值/说明 | 行 |
| --- | --- | --- | --- |
| 卡片外壳 | `group overflow-hidden border-border/50 bg-card hover:border-accent/50 transition-all duration-300 cursor-pointer rounded-lg p-0` | 悬停边框变 `accent/50`，300ms 过渡；`rounded-lg`=8px | `:31` |
| 骨架占位 | `absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-muted via-muted/70 to-background` | 图片加载前脉冲渐变 | `:36` |
| 图片（有比例） | `object-cover transition-all duration-300 group-hover:scale-105` + `opacity-100/opacity-0`（loaded 切换） | 悬停放大 1.05，300ms；加载完成淡入 | `:53` |
| 图片（无比例） | `w-full h-auto transition-all duration-300 group-hover:scale-105 block` + `opacity-100/opacity-0` | 无 `aspectRatio` 时按自然高度 | `:65` |
| 浏览量角标 | `absolute right-2 top-2 ... bg-black/60 ... text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 z-20` | 悬停显隐，`Eye h-3.5 w-3.5` | `:72-73` |

---

### 2. 图片弹窗（ImageModal）

来源：`src/features/gallery/components/image-modal.tsx`，底层 `src/shared/ui/dialog.tsx`。

#### 2.1 Dialog 基座与遮罩

`DialogOverlay`（`dialog.tsx:38-45`）：`fixed inset-0 z-50 bg-black/50`（50% 黑遮罩），开合动画 `data-[state=open]:animate-in / fade-in-0`、`data-[state=closed]:animate-out / fade-out-0`（`:41`）。

`DialogContent` 基类（`dialog.tsx:60-66`，className 位于 `:62-64`）自带：`fixed top-[50%] left-[50%] translate-x/y-[-50%]` 居中、`z-50`、`grid`、`gap-4`、`w-full max-w-[calc(100%-2rem)] sm:max-w-lg`、`rounded-xl`、`p-6`、`duration-200`，以及缩放淡入淡出：`data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`（缩放 95%）配合 `fade-*`。

> **重要坑**：`DialogContent` 基类还带 `text-white bg-black/20 backdrop-blur-xl border-white/10 ring-1 ring-white/10 dark:ring-white/5`（`dialog.tsx:63`）。本弹窗通过 className **覆盖**了背景/边框（见下），但基类 `text-white` 默认继承到浮层内所有未显式指定颜色的文本。凡在弹窗里放文字/按钮，**必须显式给 `text-foreground` / `text-muted-foreground` / `text-slate-950` 等**，否则会继承成白字。粘性底栏 CTA 就显式写了 `text-slate-950`（`:468`）来对抗这一继承。

#### 2.2 ImageModal 的 DialogContent 覆盖类

```html
<DialogContent
  className="!max-w-[95vw] !w-full md:!max-w-[1600px] !h-[92vh] p-0 gap-0 outline-none
             border border-white/30 dark:border-white/10
             shadow-2xl shadow-slate-900/15 overflow-hidden rounded-xl
             bg-white/78 dark:bg-zinc-950/78 backdrop-blur-2xl"
  showCloseButton={false} />
```
来源：`image-modal.tsx:266-269`（className 在 `:267`）。

| 属性 | 值 | 说明 |
| --- | --- | --- |
| 最大宽 | `!max-w-[95vw]` → `md:!max-w-[1600px]` | `!` 强制覆盖基类 `sm:max-w-lg`；桌面上限 1600px |
| 宽/高 | `!w-full`；`!h-[92vh]` | 高度锁定 92vh |
| 内边距 | `p-0 gap-0` | 清零基座 `p-6`/`gap-4`，交给内部栅格 |
| 圆角 | `rounded-xl` = `0.75rem` = 12px |
| 边框 | `border border-white/30`（暗 `white/10`）= 1px |
| 阴影 | `shadow-2xl shadow-slate-900/15` | slate-900 15% 透明有色阴影 |
| 磨砂背景 | `bg-white/78`（暗 `bg-zinc-950/78`）+ `backdrop-blur-2xl`（模糊 40px） | 亮/暗均 78% 不透明度 |
| 关闭按钮 | `showCloseButton={false}` | 禁用 Dialog 自带右上角关闭，改用自定义两套按钮 |

#### 2.3 左图右信息栅格

来源：`image-modal.tsx:273`。

```
grid-cols-1
md:grid-cols-[minmax(0,1fr)_360px]
lg:grid-cols-[minmax(0,1fr)_420px]
grid-rows-[38vh_minmax(0,1fr)]  md:grid-rows-1
h-full min-h-0 w-full overflow-hidden
```

| 断点 | 布局 | 右栏宽 |
| --- | --- | --- |
| `< md`（移动） | 单列上下：图 `38vh` + 信息 `1fr` | — |
| `md`（≥768） | 左图 `1fr` + 右信息 | `360px` |
| `lg`（≥1024） | 左图 `1fr` + 右信息 | `420px` |

左栏用 `minmax(0,1fr)`（可收缩，防溢出）。

#### 2.4 左侧图片区（氛围背景 + 主图）

左栏容器（`:275`）：`relative h-full md:h-full min-h-0 w-full bg-muted/20 flex items-center justify-center p-3 md:p-6 overflow-hidden group`。`group` 供翻页/关闭按钮的 hover 显隐。

- **氛围背景层**（`:278-286`）：外层 `absolute inset-0 z-0 overflow-hidden`，内 `<Image fill>` + `object-cover blur-3xl opacity-20 scale-110`。`blur-3xl` = 64px 模糊，`opacity-20` = 0.2，`scale-110` = 放大 1.1 以遮住模糊边缘。
- **主图层**（`:288-297`）：外层 `relative ... z-10`，`<Image fill>` + `object-contain max-h-full max-w-full`，`sizes="(max-width: 768px) 100vw, 80vw"`，`priority`。

#### 2.5 翻页悬浮圆钮

来源：`image-modal.tsx:301-318`（左 `ChevronLeft` / 右 `ChevronRight`，`h-6 w-6`）。仅当存在 `previousPrompt` / `nextPrompt` 时渲染。

```
absolute left-3 md:left-6 top-1/2 -translate-y-1/2
p-2.5 md:p-3 rounded-full
bg-black/20 hover:bg-black/30 text-white
md:text-foreground/80 md:hover:text-foreground
dark:bg-white/10 dark:hover:bg-white/20
transition-all md:opacity-0 group-hover:opacity-100 duration-300
backdrop-blur-md z-50
```

| 属性 | 值 |
| --- | --- |
| 内边距 | `p-2.5`(10px) → `md:p-3`(12px) |
| 底色 | `bg-black/20` → hover `bg-black/30`（暗色 `white/10`→`white/20`） |
| 模糊 | `backdrop-blur-md` = 12px |
| 显隐 | 移动端常显；`md` 起 `opacity-0`，鼠标进入左栏 `group` 时 `group-hover:opacity-100`，`duration-300` 渐显 |
| 层级 | `z-50` |

键盘：`ArrowLeft`/`ArrowRight` 翻页、`Escape` 关闭（`:161-178`）。

#### 2.6 关闭按钮（桌面 / 移动两套）

| 版本 | 类摘要 | 行 |
| --- | --- | --- |
| 桌面（`X h-6 w-6`） | `absolute top-6 left-6 p-3 rounded-full bg-black/20 hover:bg-black/30 text-foreground/80 hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 ... md:block hidden opacity-0 group-hover:opacity-100 duration-300 backdrop-blur-md z-50` | `:321-327` |
| 移动（`X h-5 w-5`） | `md:hidden fixed top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-md z-[100] shadow-lg` | `:330-336` |

规则：桌面版**仅悬停可见**（`opacity-0 group-hover:opacity-100`）且位于左上；移动版**常显**、更深底色 `bg-black/60`、`z-[100]`（高于翻页钮 `z-50`），用 `fixed` 贴视口右上，避免被弹窗滚动裁掉。

#### 2.7 右信息栏

容器（`:340`）：`flex flex-col border-t md:border-t-0 md:border-l border-white/30 dark:border-white/10 min-h-0 bg-white/78 dark:bg-zinc-950/78 backdrop-blur-2xl h-full overflow-hidden`。移动端顶边分隔，桌面改左边分隔线（1px、`white/30`，暗 `white/10`）。

- 内容区内边距：`h-full p-4 md:p-8 flex flex-col gap-4 md:gap-6 overflow-hidden`（`:347`）。
- 标题 `DialogTitle`：`text-xl md:text-3xl font-bold leading-tight tracking-tight text-foreground`（`:351`）。
- 点赞按钮（`:355-363`）：`rounded-full transition-colors hover:bg-pink-500/10 hover:text-pink-500`；激活态 `text-pink-500 bg-pink-500/10`，未激活 `text-muted-foreground`；图标 `Heart h-5 w-5 md:h-6 md:w-6`，激活时加 `fill-current`。分享按钮 `Share2 h-5 w-5`（`:364-366`）。
- 元数据胶囊（`:377-394`）：`inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border/50 text-muted-foreground`，前导圆点 `w-1.5 h-1.5 rounded-full`（**6px × 6px**，`w-1.5`=`0.375rem`=6px，非 1.5px）+ `mr-2`；比例点=`bg-cyan-200`、模型点=`bg-slate-300`、风格点=`bg-white border border-slate-300`。

#### 2.8 Prompt 代码块（含自定义细滚动条）

来源：`image-modal.tsx:406-441`（滚动容器 className 在 `:408`）。

```
h-full max-h-full bg-muted rounded-lg p-4 md:p-5
font-mono text-xs md:text-sm leading-relaxed text-foreground
shadow-inner border border-border
overflow-x-auto overflow-y-auto
[&::-webkit-scrollbar]:w-2
[&::-webkit-scrollbar-thumb]:bg-border/40
[&::-webkit-scrollbar-thumb]:rounded-full
hover:[&::-webkit-scrollbar-thumb]:bg-border/60
```

| 属性 | 值 |
| --- | --- |
| 背景 | `bg-muted`（亮 `oklch(0.97 0 0)` ≈ `#f7f7f7`；暗 `oklch(0.269 0 0)` ≈ `#404040`） |
| 圆角 | `rounded-lg` = `0.5rem` = 8px |
| 内边距 | `p-4`(16px) → `md:p-5`(20px) |
| 字体 | `font-mono`，`text-xs`(12px) → `md:text-sm`(14px)，`leading-relaxed`(1.625) |
| 边框/内阴影 | `border border-border`(1px) + `shadow-inner` |
| 外层最小高 | `flex-1 min-h-[160px] md:min-h-0`（`:406`） |
| 文本换行 | `whitespace-pre-wrap break-words`（`:426`） |
| 滚动条槽宽 | `[&::-webkit-scrollbar]:w-2` = 8px |
| 滚动条滑块 | `bg-border/40`，hover `bg-border/60`，`rounded-full` |

三种态：内容未公开 → `Lock h-6 w-6` 锁定卡片（`:411-419`）；加载中 → `Loader2 h-4 w-4 animate-spin` +「正在加载 Prompt...」（`:420-424`）；正常 → 正文，缺内容时占位「暂无 Prompt 内容」（`:427`）。右上角复制按钮（`:431-440`）：`size="icon" variant="secondary"` + `absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity h-8 w-8 z-10`，复制成功切换 `Check h-4 w-4 text-green-500` / `Copy h-4 w-4`，2s 后自动复位（`:207`）。

#### 2.9 粘性底栏主 CTA（渐变）

来源：`image-modal.tsx:465-475`。底栏容器（`:465`）：`p-3 md:p-6 border-t border-white/30 dark:border-white/10 bg-white/78 dark:bg-zinc-950/78 backdrop-blur-2xl flex flex-col gap-3 shrink-0`。

CTA 按钮（`:466-474`，`size="lg"`）：
```
w-full font-semibold h-11 md:h-12 text-sm md:text-base
shadow-lg shadow-cyan-100/20
bg-gradient-to-r from-slate-200 via-white to-cyan-100
hover:from-white hover:via-slate-100 hover:to-cyan-50
text-slate-950 border-0
```

| 属性 | 值 |
| --- | --- |
| 高度 | `h-11`(2.75rem=44px) → `md:h-12`(3rem=48px) |
| 渐变（默认） | 左→右 `slate-200 → white → cyan-100` |
| 渐变（hover） | `white → slate-100 → cyan-50`（整体提亮） |
| 文字色 | `text-slate-950`（**显式指定，抵消 Dialog 基类 `text-white` 继承**） |
| 阴影 | `shadow-lg shadow-cyan-100/20` |
| 图标 | `Sparkles h-5 w-5 mr-2` |

> 规则：此浮层内的浅色渐变按钮**必须**保留 `text-slate-950 border-0`。若复制此按钮到别处而漏掉 `text-slate-950`，在 Dialog 上下文中会因基类继承白字导致文字不可见。

---

### 3. 动效总表

| 动效 | 类 | 数值/时长 | 典型用处 | 来源 |
| --- | --- | --- | --- | --- |
| 弹窗开合缩放 | `data-[state=open]:zoom-in-95` / `data-[state=closed]:zoom-out-95` | 缩放 95% ↔ 100% | Dialog 出现/消失 | `dialog.tsx:63` |
| 弹窗/遮罩淡入淡出 | `data-[state=open]:fade-in-0` / `data-[state=closed]:fade-out-0` | opacity 0↔1 | Dialog、Overlay | `dialog.tsx:41,63` |
| 弹窗过渡时长 | `duration-200` | 200ms | DialogContent 基座 | `dialog.tsx:63` |
| 悬浮按钮渐显 | `md:opacity-0 group-hover:opacity-100 duration-300` | 0→1，300ms | 翻页钮、桌面关闭钮、复制钮 | `image-modal.tsx:304,323,434` |
| 卡片/图片过渡 | `transition-all duration-300` | 300ms | 卡片边框、图片 | `image-card.tsx:31,53,65` |
| 悬停放大 | `group-hover:scale-105` | 缩放 1.05 | 卡片图片 | `image-card.tsx:53,65` |
| 颜色过渡 | `transition-colors` | 默认 150ms | 点赞按钮 | `image-modal.tsx:358` |
| 颜色+阴影过渡 | `transition-[color,box-shadow]` | 默认 150ms | Tabs 触发器 | `tabs.tsx:45` |
| 不透明度过渡 | `transition-opacity` | 默认 150ms | 复制按钮、卡片角标 | `image-modal.tsx:434`；`image-card.tsx:72` |
| 旋转 | `animate-spin` | 1s linear 无限 | 加载圈、`Loader2` | `client-gallery.tsx:230`；`image-modal.tsx:422` |
| 脉冲 | `animate-pulse` | 2s 无限 | 图片骨架占位 | `image-card.tsx:36` |

约定：本章文件中出现的显式时长只有两档 —— `duration-200`（弹窗）与 `duration-300`（悬停/渐显）；`transition-colors` / `transition-opacity` / `transition-[color,box-shadow]` 使用 Tailwind 默认 150ms。新增交互沿用此约定，不要引入随意时长。

---

### 4. Toast 通知（Sonner）

来源：`src/shared/ui/sonner.tsx`。`Toaster` 读取 `next-themes` 的 `theme`（默认 `'system'`，`:7`）传给 sonner。调用方式：`import { toast } from "sonner"`，用 `toast.success/error/()`（见 `image-modal.tsx:190,208,229,235,258` 等）。

#### 4.1 基础 toast 样式（磨砂玻璃）

`classNames.toast`（`sonner.tsx:15-16`）：
```
border border-white/35 bg-white/78 text-slate-900
shadow-2xl shadow-slate-900/10 backdrop-blur-2xl
dark:border-white/12 dark:bg-zinc-950/78 dark:text-zinc-50
```

| 属性 | 亮色 | 暗色 |
| --- | --- | --- |
| 边框 | `white/35`（1px） | `white/12` |
| 背景 | `bg-white/78`（78%） | `bg-zinc-950/78` |
| 文字 | `text-slate-900` | `text-zinc-50` |
| 模糊 | `backdrop-blur-2xl`(40px) | 同 |
| 阴影 | `shadow-2xl shadow-slate-900/10` | 同 |

标题/描述：`title` = `text-sm font-semibold tracking-normal`；`description` = `text-xs text-slate-600 dark:text-zinc-300`（`:17-18`）。

#### 4.2 状态变体（边框着色）

来源：`sonner.tsx:19-23`。

| 变体 | 主色 | 关键类 |
| --- | --- | --- |
| success（翡翠绿，`:20`） | emerald | `border-emerald-200/70 text-emerald-500 dark:border-emerald-300/20 dark:text-emerald-300` + 图标/标题强制绿：`[&_[data-title]]:text-emerald-500 dark:[&_[data-title]]:text-emerald-300 [&_[data-icon]]:text-emerald-400 [&_svg]:text-emerald-400` |
| error（红，`:21`） | red | `border-red-200/80 dark:border-red-300/20` |
| warning（琥珀，`:22`） | amber | `border-amber-200/80 dark:border-amber-300/20` |
| info（石板灰，`:23`） | slate | `border-slate-200/80 dark:border-white/12` |

> success 变体额外用 `[&_[data-title]]` / `[&_[data-icon]]` / `[&_svg]` 选择器把标题与图标强制染绿，这是唯一一个改文字色的变体；其余变体仅改边框色。

#### 4.3 关闭按钮

`classNames.closeButton`（`:24-25`）：
```
border-white/40 bg-white/70 text-slate-500 backdrop-blur-md
hover:bg-white hover:text-slate-900
dark:border-white/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20 dark:hover:text-white
```

#### 4.4 CSS 变量（sonner 内建令牌）

`style` inline 传入（`sonner.tsx:28-40`，令牌定义在 `:30-38`），用 `color-mix` 让底色跟随主题令牌并保持 78% 透明：

| 变量 | 值 |
| --- | --- |
| `--normal-bg` | `color-mix(in srgb, var(--background) 78%, transparent)` |
| `--normal-text` | `var(--foreground)` |
| `--normal-border` | `color-mix(in srgb, var(--border) 70%, transparent)` |
| `--success-bg` | `color-mix(in srgb, var(--background) 78%, transparent)` |
| `--success-text` | `#34d399`（emerald-400） |
| `--success-border` | `color-mix(in srgb, #a7f3d0 80%, transparent)`（emerald-200 @80%） |
| `--error-bg` | `color-mix(in srgb, var(--background) 78%, transparent)` |
| `--error-text` | `var(--foreground)` |
| `--error-border` | `color-mix(in srgb, #fecaca 80%, transparent)`（red-200 @80%） |

其中 `var(--background)` 亮色 = `oklch(1 0 0)`(#fff)、暗色 = `oklch(0.145 0 0)` ≈ `#242424`；`var(--foreground)` 亮 = `oklch(0.145 0 0)`、暗 = `oklch(0.985 0 0)` ≈ `#fafafa`；`var(--border)` 亮 = `oklch(0.922 0 0)` ≈ `#e6e6e6`、暗 = `oklch(0.269 0 0)`（`globals.css:7-8,23,43-44,59`）。

规则：Toast 的着色**双轨制** —— `classNames` 里的 Tailwind 类负责边框/文字，`style` 里的 CSS 变量负责底色/默认边框。改配色需两处一致，否则亮暗切换会出现色差。

---

### 5. Tabs（排行页周期切换）

来源：`src/shared/ui/tabs.tsx`；使用见 `src/app/top/page.tsx:104-131`（今日/本周/本月三列等宽 Tab）。

| 部件 | 类 | 关键值 | 行 |
| --- | --- | --- | --- |
| `Tabs`(Root) | `flex flex-col gap-2` | gap = 8px | `tabs.tsx:15` |
| `TabsList` | `bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]` | 高 `h-9`=2.25rem=36px；圆角 `rounded-lg`=8px；内衬 `p-[3px]`=3px | `tabs.tsx:29` |
| `TabsTrigger` | 见下 | 高 `h-[calc(100%-1px)]`；圆角 `rounded-md`=6px | `tabs.tsx:45` |
| `TabsContent` | `flex-1 outline-none` | — | `tabs.tsx:60` |

排行页额外给 `TabsList` 加 `grid w-full max-w-md mx-auto grid-cols-3`（`top/page.tsx:105`），三 Tab 等宽；`TabsContent` 加 `mt-8`（`top/page.tsx:112`）。

`TabsTrigger` 完整类（`tabs.tsx:45`）关键点：
- 激活态：`data-[state=active]:bg-background data-[state=active]:shadow-sm`；暗色 `dark:data-[state=active]:bg-input/30 dark:data-[state=active]:border-input dark:data-[state=active]:text-foreground`。默认文字 `text-foreground dark:text-muted-foreground`。
- 焦点环：`focus-visible:ring-ring/50 focus-visible:ring-[3px]`（**3px** 环）+ `focus-visible:border-ring focus-visible:outline-ring focus-visible:outline-1`。
- 尺寸：`h-[calc(100%-1px)] flex-1 px-2 py-1 text-sm font-medium whitespace-nowrap`，`border border-transparent`（激活时暗色才显边框）。
- 过渡：`transition-[color,box-shadow]`（只过渡颜色与阴影，不含 transform）。
- 内嵌图标：`[&_svg:not([class*='size-'])]:size-4`（默认 16px）、`[&_svg]:shrink-0 [&_svg]:pointer-events-none`，图标与文字间距 `gap-1.5`(6px)。
- 禁用态：`disabled:pointer-events-none disabled:opacity-50`。

---

<a id="changelog"></a>

## 变更记录

> 每次调整 UI / 样式后在此登记一行：日期 · 提交号 · 影响章节 · 变更摘要。保持倒序（最新在上）。

| 日期 | 提交 | 章节 | 变更摘要 |
|---|---|---|---|
| 2026-07-22 | (本次) | 5/6 玻璃·浮层 · 12 画廊 · 全站 | **UI 一致性统一 + 精简**：磨砂玻璃收敛为单一配方 `bg-white/78 dark:bg-zinc-950/78` + `border-white/30 dark:border-white/10`（ImageModal 各面板与 Toast 对齐）；Dialog/AlertDialog 基类统一为主题自适应 `bg-background/90 text-foreground`（登录弹窗补 `text-white` 保持原样，仍是全站唯一强制深色浮层）；首页页脚补 `border-t border-border/40`；图上桌面关闭按钮透明度对齐翻页钮（`bg-black/20 hover:bg-black/30`）；登录图标 `rounded-2xl`→`rounded-xl`；"红线规则"随基类自适应大幅简化。 |
| 2026-07-22 | `8a01aef` | 6 · 玻璃/浮层 | 确认弹窗「取消」按钮补 `text-foreground`，修复明亮主题白字白底不可见（弹窗背景保持原样）。 |
| 2026-07-22 | (初始) | 全部 | 依据当前代码首次生成完整 UI 设计规范。 |
