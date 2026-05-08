
import fs from 'fs/promises';
import path from 'path';
import type { Category, Prompt, Tag } from '@/core/types';
import { prompts as seedPrompts } from '@/core/mock-data';
import { appDefaults, categories as seedCategories, isPublishedPrompt, tags as seedTags } from '@/config';
import {
    CATEGORIES_FILE,
    PROMPT_CONTENT_DIR,
    PROMPTS_INDEX_FILE,
    TAGS_FILE,
} from './storage-paths';
import { atomicWriteFile, atomicWriteJson, ensureLocalStore, touchLocalStore } from './local-store';

type PromptIndexRecord = Omit<Prompt, 'content'> & {
    contentFile?: string
    content?: string
}

export class JSONFileDB {
    private static writeQueue: Promise<unknown> = Promise.resolve();

    private static async withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
        const run = this.writeQueue.then(operation, operation);
        this.writeQueue = run.catch(() => undefined);
        return run;
    }

    private static async ensureDB() {
        await ensureLocalStore();

        try {
            await fs.access(PROMPTS_INDEX_FILE);
        } catch {
            const prompts = this.normalizePrompts(JSON.parse(JSON.stringify(seedPrompts)), true);
            await this.writePromptStore(prompts);
        }
    }

    private static async ensureTagsDB() {
        await ensureLocalStore();

        try {
            await fs.access(TAGS_FILE);
        } catch {
            await atomicWriteJson(TAGS_FILE, seedTags);
            await touchLocalStore();
        }
    }

    private static async ensureCategoriesDB() {
        await ensureLocalStore();

        try {
            await fs.access(CATEGORIES_FILE);
        } catch {
            await atomicWriteJson(CATEGORIES_FILE, seedCategories);
            await touchLocalStore();
        }
    }

    private static contentFileFor(promptId: string) {
        return `${promptId}.txt`;
    }

    private static async readPromptContent(record: PromptIndexRecord): Promise<string> {
        if (record.content !== undefined) return record.content;
        if (!record.contentFile) return "";

        try {
            return await fs.readFile(path.join(PROMPT_CONTENT_DIR, record.contentFile), 'utf-8');
        } catch {
            return "";
        }
    }

    private static normalizePrompts(prompts: any[], includeContent: boolean): Prompt[] {
        return prompts.map((p: any) => ({
            ...p,
            content: includeContent ? String(p.content || "") : "",
            tags: Array.isArray(p.tags) ? p.tags : [],
            views: Number(p.views ?? 0),
            copies: Number(p.copies ?? 0),
            likes: Number(p.likes ?? 0),
            status: p.status || appDefaults.prompt.status,
            createdAt: new Date(p.createdAt),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
        }));
    }

    private static async writePromptStore(prompts: Prompt[]): Promise<void> {
        await fs.mkdir(PROMPT_CONTENT_DIR, { recursive: true });

        const index: PromptIndexRecord[] = [];
        await Promise.all(prompts.map(async (prompt) => {
            const contentFile = this.contentFileFor(prompt.id);
            await atomicWriteFile(path.join(PROMPT_CONTENT_DIR, contentFile), prompt.content || "");

            const { content: _content, ...rest } = prompt;
            index.push({
                ...rest,
                contentFile,
            });
        }));

        index.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        await atomicWriteJson(PROMPTS_INDEX_FILE, index);

        const activeContentFiles = new Set(index.map(prompt => prompt.contentFile).filter(Boolean));
        const currentContentFiles = await fs.readdir(PROMPT_CONTENT_DIR).catch(() => []);
        await Promise.all(currentContentFiles.map(async (filename) => {
            if (filename.startsWith(".")) return;
            if (activeContentFiles.has(filename)) return;
            await fs.unlink(path.join(PROMPT_CONTENT_DIR, filename)).catch(() => undefined);
        }));

        await touchLocalStore();
    }

    static async getAllPrompts(options: { includeContent?: boolean } = {}): Promise<Prompt[]> {
        const includeContent = options.includeContent ?? true;
        await this.ensureDB();
        const data = await fs.readFile(PROMPTS_INDEX_FILE, 'utf-8');
        const records: PromptIndexRecord[] = JSON.parse(data);
        const prompts = await Promise.all(records.map(async (record) => ({
            ...record,
            content: includeContent ? await this.readPromptContent(record) : "",
        })));
        return this.normalizePrompts(prompts, includeContent);
    }

    static async getPromptById(id: string): Promise<Prompt | undefined> {
        const prompts = await this.getAllPrompts({ includeContent: true });
        return prompts.find(p => p.id === id);
    }

    static async savePrompt(prompt: Prompt): Promise<void> {
        await this.withWriteLock(async () => {
            const prompts = await this.getAllPrompts();
            const index = prompts.findIndex(p => p.id === prompt.id);

            if (index >= 0) {
                prompts[index] = prompt;
            } else {
                prompts.unshift(prompt);
            }

            await this.writePromptStore(prompts);
        });
    }

    static async deletePrompt(id: string): Promise<void> {
        await this.withWriteLock(async () => {
            let prompts = await this.getAllPrompts();
            prompts = prompts.filter(p => p.id !== id);
            await this.writePromptStore(prompts);
        });
    }

    static async deletePrompts(ids: string[]): Promise<number> {
        return this.withWriteLock(async () => {
            const idSet = new Set(ids);
            const prompts = await this.getAllPrompts();
            const nextPrompts = prompts.filter(prompt => !idSet.has(prompt.id));
            await this.writePromptStore(nextPrompts);
            return prompts.length - nextPrompts.length;
        });
    }

    static async updatePrompts(
        ids: string[],
        updates: Partial<Pick<Prompt, 'status' | 'categoryId' | 'tags'>>
    ): Promise<Prompt[]> {
        return this.withWriteLock(async () => {
            const idSet = new Set(ids);
            const prompts = await this.getAllPrompts();
            const updated: Prompt[] = [];

            const nextPrompts = prompts.map(prompt => {
                if (!idSet.has(prompt.id)) return prompt;

                const nextPrompt: Prompt = {
                    ...prompt,
                    ...updates,
                    updatedAt: new Date(),
                    publishedAt: updates.status && isPublishedPrompt({ status: updates.status }) && !prompt.publishedAt
                        ? new Date()
                        : prompt.publishedAt,
                };
                updated.push(nextPrompt);
                return nextPrompt;
            });

            await this.writePromptStore(nextPrompts);
            return updated;
        });
    }

    static async incrementPromptStat(
        id: string,
        statType: 'views' | 'copies' | 'likes'
    ): Promise<Prompt | null> {
        return this.withWriteLock(async () => {
            const prompts = await this.getAllPrompts();
            const index = prompts.findIndex(p => p.id === id);
            if (index < 0) return null;

            const prompt = prompts[index];
            const nextPrompt = {
                ...prompt,
                [statType]: (prompt[statType] || 0) + 1,
                updatedAt: prompt.updatedAt || new Date(),
            };

            prompts[index] = nextPrompt;
            await this.writePromptStore(prompts);
            return nextPrompt;
        });
    }

    static async getStats(promptId: string): Promise<{ views: number; copies: number; likes: number } | null> {
        const prompts = await this.getAllPrompts({ includeContent: false });
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt) return null;

        return {
            views: prompt.views || 0,
            copies: prompt.copies || 0,
            likes: prompt.likes || 0,
        };
    }

    static async getBatchStats(promptIds: string[]): Promise<Map<string, { views: number; copies: number; likes: number }>> {
        const prompts = await this.getAllPrompts({ includeContent: false });
        const requested = new Set(promptIds);
        const result = new Map<string, { views: number; copies: number; likes: number }>();

        prompts.forEach(prompt => {
            if (requested.has(prompt.id)) {
                result.set(prompt.id, {
                    views: prompt.views || 0,
                    copies: prompt.copies || 0,
                    likes: prompt.likes || 0,
                });
            }
        });

        return result;
    }

    static async getAllTags(): Promise<Tag[]> {
        await this.ensureTagsDB();
        const data = await fs.readFile(TAGS_FILE, 'utf-8');
        return JSON.parse(data);
    }

    static async saveTag(tag: Tag, oldId?: string): Promise<Tag> {
        return this.withWriteLock(async () => {
            const tags = await this.getAllTags();
            const normalizedTag = {
                ...tag,
                id: tag.id || tag.slug,
                slug: tag.slug || tag.id,
            };
            const lookupId = oldId || normalizedTag.id;
            const index = tags.findIndex(t => t.id === lookupId);

            if (index >= 0) {
                tags[index] = normalizedTag;
            } else {
                tags.push(normalizedTag);
            }

            await atomicWriteJson(TAGS_FILE, tags);
            await touchLocalStore();

            if (oldId && oldId !== normalizedTag.id) {
                const prompts = await this.getAllPrompts();
                const nextPrompts = prompts.map(prompt => ({
                    ...prompt,
                    tags: prompt.tags.map(tagId => tagId === oldId ? normalizedTag.id : tagId),
                }));
                await this.writePromptStore(nextPrompts);
            }

            return normalizedTag;
        });
    }

    static async deleteTag(id: string): Promise<void> {
        await this.withWriteLock(async () => {
            const tags = await this.getAllTags();
            await atomicWriteJson(TAGS_FILE, tags.filter(t => t.id !== id));
            await touchLocalStore();
        });
    }

    static async getAllCategories(): Promise<Category[]> {
        await this.ensureCategoriesDB();
        const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
        return JSON.parse(data);
    }

    static async saveCategory(category: Category): Promise<Category> {
        return this.withWriteLock(async () => {
            const categories = await this.getAllCategories();
            const normalizedCategory = {
                ...category,
                id: category.id || category.slug,
                slug: category.slug || category.id,
                order: Number(category.order ?? categories.length + 1),
                enabled: category.enabled ?? true,
            };
            const index = categories.findIndex(c => c.id === normalizedCategory.id);

            if (index >= 0) {
                categories[index] = normalizedCategory;
            } else {
                categories.push(normalizedCategory);
            }

            categories.sort((a, b) => a.order - b.order);
            await atomicWriteJson(CATEGORIES_FILE, categories);
            await touchLocalStore();

            return normalizedCategory;
        });
    }

    static async deleteCategory(id: string): Promise<void> {
        await this.withWriteLock(async () => {
            const categories = await this.getAllCategories();
            await atomicWriteJson(CATEGORIES_FILE, categories.filter(c => c.id !== id));
            await touchLocalStore();
        });
    }
}
