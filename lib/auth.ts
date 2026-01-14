
import { cookies } from 'next/headers';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
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
            secure: process.env.NODE_ENV === 'production',
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
