
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';

// 延迟获取环境变量，避免在构建时报错
function getAdminCredentials() {
    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPassword) {
        throw new Error(
            `❌ SECURITY ERROR: ADMIN_USER and ADMIN_PASSWORD environment variables are required.\n` +
            `Please set them in your .env.local file or environment configuration.`
        );
    }

    return { adminUser, adminPassword };
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);

    // In a real app, this should be a valid JWT signed token
    // For simplicity, we just check if the cookie value matches a "secret"
    return session?.value === 'authenticated';
}

export async function login(password: string, username: string) {
    const { adminUser, adminPassword } = getAdminCredentials();

    if (password === adminPassword && username === adminUser) {
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
