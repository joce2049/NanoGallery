-- ================================================
-- Supabase 数据库初始化脚本
-- 用于 Nano Gallery 统计功能
-- ================================================

-- 1. 创建 prompt_stats 表（存储统计数据）
CREATE TABLE IF NOT EXISTS prompt_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id TEXT UNIQUE NOT NULL,
    views INTEGER DEFAULT 0,
    copies INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_prompt_stats_prompt_id ON prompt_stats(prompt_id);

-- 3. 创建更新时间自动更新的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_prompt_stats_updated_at ON prompt_stats;
CREATE TRIGGER update_prompt_stats_updated_at
    BEFORE UPDATE ON prompt_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 创建原子增加计数的 RPC 函数
CREATE OR REPLACE FUNCTION increment_stat(
    p_prompt_id TEXT,
    p_stat_type TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO prompt_stats (prompt_id, views, copies, likes)
    VALUES (
        p_prompt_id,
        CASE WHEN p_stat_type = 'views' THEN 1 ELSE 0 END,
        CASE WHEN p_stat_type = 'copies' THEN 1 ELSE 0 END,
        CASE WHEN p_stat_type = 'likes' THEN 1 ELSE 0 END
    )
    ON CONFLICT (prompt_id) DO UPDATE SET
        views = prompt_stats.views + CASE WHEN p_stat_type = 'views' THEN 1 ELSE 0 END,
        copies = prompt_stats.copies + CASE WHEN p_stat_type = 'copies' THEN 1 ELSE 0 END,
        likes = prompt_stats.likes + CASE WHEN p_stat_type = 'likes' THEN 1 ELSE 0 END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. 可选：创建详细事件表（用于高级分析）
CREATE TABLE IF NOT EXISTS stat_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'copy', 'like')),
    visitor_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stat_events_prompt_id ON stat_events(prompt_id);
CREATE INDEX IF NOT EXISTS idx_stat_events_created_at ON stat_events(created_at);

-- 6. 设置 RLS（行级安全策略）
-- 允许匿名用户读取和写入统计数据
ALTER TABLE prompt_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_events ENABLE ROW LEVEL SECURITY;

-- 允许所有人插入和更新统计
CREATE POLICY "Allow anonymous insert on prompt_stats" ON prompt_stats
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update on prompt_stats" ON prompt_stats
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous select on prompt_stats" ON prompt_stats
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert on stat_events" ON stat_events
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous select on stat_events" ON stat_events
    FOR SELECT TO anon USING (true);

-- ================================================
-- 使用说明：
-- 1. 登录 Supabase 控制台
-- 2. 进入 SQL Editor
-- 3. 粘贴此脚本并执行
-- 4. 在 Project Settings > API 获取 URL 和 anon key
-- 5. 将它们添加到 .env 文件
-- ================================================
