
import fs from 'fs/promises';
import path from 'path';
import { Prompt } from './types';
import { prompts as seedPrompts } from './mock-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'prompts.json');

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

    static async getAllPrompts(): Promise<Prompt[]> {
        await this.ensureDB();
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const prompts = JSON.parse(data);
        // Revive Date objects
        return prompts.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
        }));
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
}
