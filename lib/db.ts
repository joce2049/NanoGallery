
import fs from 'fs/promises';
import path from 'path';
import { Category, Prompt, Tag } from './types';
import { prompts as seedPrompts } from './mock-data';
import { categories as seedCategories, tags as seedTags } from './config';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'prompts.json');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

export class JSONFileDB {
    private static async ensureDB() {
        try {
            await fs.access(DB_FILE);
        } catch {
            // File doesn't exist, seed it
            await fs.mkdir(DATA_DIR, { recursive: true });
            // Convert Date objects to ISO strings for JSON
            const seedData = JSON.parse(JSON.stringify(seedPrompts));
            await fs.writeFile(DB_FILE, JSON.stringify(seedData, null, 2));
        }
    }

    private static async ensureTagsDB() {
        try {
            await fs.access(TAGS_FILE);
        } catch {
            await fs.mkdir(DATA_DIR, { recursive: true });
            await fs.writeFile(TAGS_FILE, JSON.stringify(seedTags, null, 2));
        }
    }

    private static async ensureCategoriesDB() {
        try {
            await fs.access(CATEGORIES_FILE);
        } catch {
            await fs.mkdir(DATA_DIR, { recursive: true });
            await fs.writeFile(CATEGORIES_FILE, JSON.stringify(seedCategories, null, 2));
        }
    }

    static async getAllPrompts(): Promise<Prompt[]> {
        await this.ensureDB();
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const prompts = JSON.parse(data);
        return prompts.map((p: any) => ({
            ...p,
            tags: Array.isArray(p.tags) ? p.tags : [],
            views: Number(p.views ?? 0),
            copies: Number(p.copies ?? 0),
            likes: Number(p.likes ?? 0),
            status: p.status || "published",
            createdAt: new Date(p.createdAt),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
        }));
    }

    static async getPromptById(id: string): Promise<Prompt | undefined> {
        const prompts = await this.getAllPrompts();
        return prompts.find(p => p.id === id);
    }

    static async savePrompt(prompt: Prompt): Promise<void> {
        const prompts = await this.getAllPrompts();
        const index = prompts.findIndex(p => p.id === prompt.id);

        if (index >= 0) {
            prompts[index] = prompt;
        } else {
            prompts.unshift(prompt);
        }

        await fs.writeFile(DB_FILE, JSON.stringify(prompts, null, 2));
    }

    static async deletePrompt(id: string): Promise<void> {
        let prompts = await this.getAllPrompts();
        prompts = prompts.filter(p => p.id !== id);
        await fs.writeFile(DB_FILE, JSON.stringify(prompts, null, 2));
    }

    static async deletePrompts(ids: string[]): Promise<number> {
        const idSet = new Set(ids);
        const prompts = await this.getAllPrompts();
        const nextPrompts = prompts.filter(prompt => !idSet.has(prompt.id));
        await fs.writeFile(DB_FILE, JSON.stringify(nextPrompts, null, 2));
        return prompts.length - nextPrompts.length;
    }

    static async updatePrompts(
        ids: string[],
        updates: Partial<Pick<Prompt, 'status' | 'categoryId' | 'tags'>>
    ): Promise<Prompt[]> {
        const idSet = new Set(ids);
        const prompts = await this.getAllPrompts();
        const updated: Prompt[] = [];

        const nextPrompts = prompts.map(prompt => {
            if (!idSet.has(prompt.id)) return prompt;

            const nextPrompt: Prompt = {
                ...prompt,
                ...updates,
                updatedAt: new Date(),
                publishedAt: updates.status === 'published' && !prompt.publishedAt
                    ? new Date()
                    : prompt.publishedAt,
            };
            updated.push(nextPrompt);
            return nextPrompt;
        });

        await fs.writeFile(DB_FILE, JSON.stringify(nextPrompts, null, 2));
        return updated;
    }

    static async incrementPromptStat(
        id: string,
        statType: 'views' | 'copies' | 'likes'
    ): Promise<Prompt | null> {
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
        await fs.writeFile(DB_FILE, JSON.stringify(prompts, null, 2));
        return nextPrompt;
    }

    static async getStats(promptId: string): Promise<{ views: number; copies: number; likes: number } | null> {
        const prompt = await this.getPromptById(promptId);
        if (!prompt) return null;

        return {
            views: prompt.views || 0,
            copies: prompt.copies || 0,
            likes: prompt.likes || 0,
        };
    }

    static async getBatchStats(promptIds: string[]): Promise<Map<string, { views: number; copies: number; likes: number }>> {
        const prompts = await this.getAllPrompts();
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

    static async saveTag(tag: Tag): Promise<Tag> {
        const tags = await this.getAllTags();
        const normalizedTag = {
            ...tag,
            id: tag.id || tag.slug,
            slug: tag.slug || tag.id,
        };
        const index = tags.findIndex(t => t.id === normalizedTag.id);

        if (index >= 0) {
            tags[index] = normalizedTag;
        } else {
            tags.push(normalizedTag);
        }

        await fs.writeFile(TAGS_FILE, JSON.stringify(tags, null, 2));
        return normalizedTag;
    }

    static async deleteTag(id: string): Promise<void> {
        const tags = await this.getAllTags();
        await fs.writeFile(TAGS_FILE, JSON.stringify(tags.filter(t => t.id !== id), null, 2));
    }

    static async getAllCategories(): Promise<Category[]> {
        await this.ensureCategoriesDB();
        const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
        return JSON.parse(data);
    }

    static async saveCategory(category: Category): Promise<Category> {
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
        await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
        return normalizedCategory;
    }

    static async deleteCategory(id: string): Promise<void> {
        const categories = await this.getAllCategories();
        await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories.filter(c => c.id !== id), null, 2));
    }
}
