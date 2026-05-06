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
```

`npm run build` 使用 `next build --webpack`，用于避开部分本地环境下 Turbopack CSS 构建时的端口权限问题。

## 项目结构

```text
app/                  页面与 API 路由
components/           前台、后台和通用 UI 组件
data/prompts.json     Prompt 内容与本地统计数据
data/tags.json        后台推荐标签数据
lib/                  数据工具、配置、认证、JSON 文件数据库、Supabase 客户端
public/               静态资源与上传图片
scripts/              工程辅助脚本
```

## 数据流说明

前台搜索页、详情页、排行页和首页内容统一读取 `data/prompts.json`。`lib/mock-data.ts` 只作为首次初始化的种子数据保留。

`lib/data-utils.ts` 是纯工具层，只负责筛选、排序、分页和标签映射，不直接读取 mock 数据或文件。

统计支持两种模式：

- 配置 Supabase 时，浏览、复制、点赞统计写入 Supabase。
- 未配置 Supabase 时，统计写回 `data/prompts.json`。

## 环境变量

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Supabase 环境变量为空时，应用会自动使用本地 JSON 统计模式。

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

图片上传策略：

```text
允许格式：JPG / PNG / WebP
最大上传大小：10MB
输出格式：WebP
最长边限制：2400px
WebP quality：82
```

## Docker 部署

```bash
docker compose up -d --build
```

生产环境建议挂载或持久化以下目录：

```text
data/
public/uploads/
```

## 备份与恢复

需要备份：

```text
data/prompts.json
data/tags.json
public/uploads/
```

恢复时将这些文件和目录放回同名路径即可。

## 生产环境建议

- 设置强密码并通过环境变量管理后台账号。
- 如果访问量较高，建议配置 Supabase 保存统计事件。
- 定期备份 `data/` 与 `public/uploads/`。
- 图片上传目录在容器部署时需要持久化。
- 发布前运行 `npm run lint`、`npm run typecheck`、`npm run build`。
