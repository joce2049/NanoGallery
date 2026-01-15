
import { cookies } from 'next/headers';

// 强制要求环境变量，不提供默认值（生产环境安全策略）
const getRequiredEnvVar = (key: string): string => {
    const value = process.env[key];

    if (!value) {
        throw new Error(
            `❌ SECURITY ERROR: Environment variable "${key}" is required but not set.\n` +
            `Please set it in your .env.local file or environment configuration.`
        );
    }

    return value;
};

const ADMIN_USER = getRequiredEnvVar('ADMIN_USER');
const ADMIN_PASSWORD = getRequiredEnvVar('ADMIN_PASSWORD');
const SESSION_COOKIE_NAME = 'admin_session';

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);

    // In a real app, this should be a valid JWT signed token
    // For simplicity, we just check if the cookie value matches a "secret"
    return session?.value === 'authenticated';
}

export async function login(password: string, username: string) {
    if (password === ADMIN_PASSWORD && username === ADMIN_USER) {
        const cookieStore = await cookies();
        // Set a simple session cookie
        cookieStore.set(SESSION_COOKIE_NAME, 'authenticated', {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true', // Only use secure cookies if explicitly configured (for HTTPS)
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });
        return true;
    }
    return false;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
