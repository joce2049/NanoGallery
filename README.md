# Nano Gallery

Nano Gallery 是一个面向 AI 图像 Prompt 的轻量画廊应用，支持前台瀑布流浏览、搜索、排行、Prompt 复制，以及后台内容上传、编辑和标签管理。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase 可选统计后端
- 本地 JSON 文件兜底数据存储
- Sharp 图片压缩与 WebP 转换

## UI 设计规范

界面/样式的唯一参照是 [UI-DESIGN-SPEC.md](UI-DESIGN-SPEC.md)（由源码提取核验生成，覆盖设计令牌、色彩、字体、间距、线条/圆角/阴影、玻璃浮层、按钮、图标、表单、卡片、导航、画廊弹窗与动效）。**任何 UI/样式改动都应先对照该文档保持一致；改动后更新对应章节并在其文末「变更记录」登记。** 配色一律使用语义令牌（`bg-background`/`text-foreground` 等），禁止硬编码色值。

## 本地启动

```bash
npm install
npm run dev
```

默认访问地址为 `http://localhost:3000`。

## 常用命令

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
npm run backup:data
```

`npm run build` 使用 `next build --webpack`，用于避开部分本地环境下 Turbopack CSS 构建时的端口权限问题。

## 项目结构

```text
src/app/              Next.js 页面、布局和 API 路由入口
src/features/         按业务域拆分的前台、后台、搜索、认证、统计等组件
src/shared/ui/        当前实际使用的 shadcn/Radix 基础 UI 组件
src/shared/lib/       跨端共享的通用工具函数
src/core/             领域类型、种子数据和纯数据处理工具
src/server/           认证、JSON 文件数据库、上传路径、Supabase、媒体清理
src/config.ts         站点、分类、标签、模型和 UI 文案配置
public/               随代码发布的静态资源
storage/              运行时数据、上传图片和备份，不提交到 Git
scripts/              工程辅助脚本
```

目录约定：

- 路由文件保持薄入口，只负责组装数据和页面组件。
- 可被前台、后台或未来移动端复用的纯逻辑放在 `src/core` 或 `src/shared`。
- 只在服务端运行、依赖文件系统或 Cookie 的代码放在 `src/server`。
- 新业务优先在 `src/features/<domain>/components` 内聚，避免再把组件平铺到根目录。

## 数据流说明

前台搜索页、详情页、排行页和首页内容统一读取运行时存储。默认路径为 `storage/data`，可通过环境变量调整。`src/core/mock-data.ts` 只保留空 Prompt 种子和配置导出，不再内置演示图片数据。

Prompt 数据已拆分：

```text
storage/data/prompts/index.json       轻量索引：标题、描述、图片、标签、统计、状态
storage/data/prompts/content/*.txt    Prompt 正文：按 Prompt ID 独立存储
storage/data/tags.json                推荐标签
storage/data/categories.json          分类
storage/data/manifest.json            本地数据仓库版本、布局和更新时间
storage/data/settings.json            用户站点配置和上传压缩配置
```

列表页默认只加载轻量索引，打开详情或弹窗时再读取对应 Prompt 正文，避免 Prompt 正文过多导致单个 JSON 文件越来越大。

本地数据仓库采用显式版本结构。应用会维护 `manifest.json`，用于记录当前数据结构版本和最后更新时间。未来需要升级数据结构时，应新增明确的迁移脚本或后台维护动作，不做隐式旧格式导入，避免本地数据发生不可预期的混用。

所有本地 JSON 和 Prompt 正文写入都通过临时文件原子替换完成；同一进程内的写操作会排队执行，减少并发保存、统计写入或容器重启时写坏文件的风险。

`src/core/data-utils.ts` 是纯工具层，只负责筛选、排序、分页和标签映射，不直接读取 mock 数据或文件。

统计支持两种模式：

- 配置 Supabase 时，浏览、复制、点赞统计写入 Supabase。
- 未配置 Supabase 时，统计写回 `storage/data/prompts/index.json`。

## 环境变量

```env
ADMIN_USER=admin
ADMIN_PASSWORD=your-password
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
TURNSTILE_SECRET_KEY=your-cloudflare-turnstile-secret-key
NANO_STORAGE_DIR=./storage
NANO_DATA_DIR=./storage/data
NANO_UPLOADS_DIR=./storage/uploads
```

Supabase 环境变量为空时，应用会自动使用本地 JSON 统计模式。

`NANO_DATA_DIR` 和 `NANO_UPLOADS_DIR` 是生产数据目录，建议挂载到代码仓库之外，避免 `git pull`、重新构建镜像或重新部署覆盖真实数据。

## 后台内容管理

后台入口：

```text
/admin
```

后台支持：

- 新建和编辑 Prompt
- 上传并自动压缩图片
- 替换已有 Prompt 图片
- 管理推荐标签
- 调整站点名称、简介、SEO 文案和后台名称
- 调整图片上传大小、主图尺寸、缩略图尺寸和 WebP 质量

图片上传策略：

```text
允许格式：JPG / PNG / WebP
默认最大上传大小：10MB，可在后台设置中调整
输出格式：WebP
默认最长边限制：3000px，可在后台设置中调整
默认 WebP quality：90，可在后台设置中调整
```

管理员登录使用 Cloudflare Turnstile 人机验证。前端只读取 `TURNSTILE_SITE_KEY`，后端使用 `TURNSTILE_SECRET_KEY` 调用 Cloudflare 校验 token；连续失败后仍会短暂冷却，降低撞库和暴力破解风险。

### 内网域名与 Turnstile

Turnstile 会校验浏览器当前访问的 hostname。真实 Key 如果只绑定公网域名，例如 `ibanana.cc.cd`，通过 `http://内网IP:3000` 访问后台时会验证失败。建议为内网也配置一个固定 hostname，例如：

```text
nano.lan
```

配置步骤：

1. 在路由器、内网 DNS、AdGuard Home、Pi-hole 或客户端 hosts 文件中，把 `nano.lan` 指向部署 Nano Gallery 的内网 IP。
2. 使用 `http://nano.lan:3000` 访问后台；如果通过内网反代，可直接使用 `http://nano.lan`。
3. 在 Cloudflare Turnstile 的 Hostname Management 中加入 `nano.lan`。

如果 Cloudflare 后台不接受 `.lan` 这类本地域名，可改用你拥有域名的内网子域名，例如 `nano.ibanana.cc.cd`，并在内网 DNS 中把它指向局域网 IP。

## Docker 部署

如果宿主机数据目录不在仓库内，先在 `.env` 中指定挂载根目录：

```env
NANO_HOST_STORAGE_DIR=/mnt/cachei/appdata/nanogallery
TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
TURNSTILE_SECRET_KEY=your-cloudflare-turnstile-secret-key
PUID=1001
PGID=1001
```

容器内路径保持默认，不需要改：

```env
NANO_STORAGE_DIR=/app/storage
NANO_DATA_DIR=/app/storage/data
NANO_UPLOADS_DIR=/app/storage/uploads
```

```bash
docker compose up -d --build
```

生产环境建议挂载或持久化以下目录：

```text
storage/data/
storage/uploads/
storage/backups/
```

`docker-compose.yml` 会把 `${NANO_HOST_STORAGE_DIR:-./storage}` 挂载到容器内的 `/app/storage` 子目录。新的写入会进入宿主机持久化目录，避免代码更新或镜像重建覆盖真实数据。

如果部署在 Unraid/NAS 上，宿主机 appdata 目录通常不是 `1001:1001` 所有。此时把 `.env` 中的 `PUID` / `PGID` 改成拥有 `/mnt/cachei/appdata/nanogallery` 写权限的用户与用户组，或把该目录授权给容器用户。否则上传图片或发布 Prompt 时可能出现 `Upload failed`、`Failed to save prompt` 或 500 错误。

## 备份与恢复

一键备份：

```bash
npm run backup:data
```

需要重点备份：

```text
storage/data/
storage/uploads/
storage/backups/
```

恢复时将 `storage/data/` 与 `storage/uploads/` 放回同名路径即可。

## 生产环境建议

- 设置强密码并通过环境变量管理后台账号。
- 如果访问量较高，建议配置 Supabase 保存统计事件。
- 定期备份 `storage/data/` 与 `storage/uploads/`。
- 图片上传目录在容器部署时需要持久化。
- 发布前运行 `npm run lint`、`npm run typecheck`、`npm run build`。
