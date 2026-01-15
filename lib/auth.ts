
import { cookies } from 'next/headers';

// 安全的环境变量读取：生产环境必须设置，开发环境可以使用默认值
const getEnvVar = (key: string, fallback: string): string => {
    const value = process.env[key];
    const isProduction = process.env.NODE_ENV === 'production';

    if (!value && isProduction) {
        throw new Error(`❌ SECURITY: Environment variable ${key} is required in production!`);
    }

    if (!value && !isProduction) {
        console.warn(`⚠️  WARNING: Using default ${key}. Set environment variable for production.`);
    }

    return value || fallback;
};

const ADMIN_USER = getEnvVar('ADMIN_USER', 'admin');
const ADMIN_PASSWORD = getEnvVar('ADMIN_PASSWORD', 'admin123');
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
