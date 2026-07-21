
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 1000; // 24 hours

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

/**
 * 会话签名密钥。优先使用显式的 AUTH_SECRET / SESSION_SECRET；
 * 否则从管理员凭据派生（改密码即失效所有旧会话）。
 * 无法得出密钥时返回 null，isAuthenticated 会安全地判为未登录，而不是抛错。
 */
function getSessionSecret(): string | null {
    const explicit = process.env.AUTH_SECRET || process.env.SESSION_SECRET;
    if (explicit) return explicit;

    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminUser || !adminPassword) return null;

    return createHmac('sha256', 'nano-gallery-session-v1')
        .update(`${adminUser}:${adminPassword}`)
        .digest('hex');
}

function sign(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('base64url');
}

function createSessionToken(secret: string): string {
    const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
    const payload = `v1.${expiresAt}`;
    return `${payload}.${sign(payload, secret)}`;
}

function verifySessionToken(token: string | undefined, secret: string): boolean {
    if (!token) return false;

    const lastDot = token.lastIndexOf('.');
    if (lastDot <= 0) return false;

    const payload = token.slice(0, lastDot);
    const providedSig = token.slice(lastDot + 1);
    const expectedSig = sign(payload, secret);

    const providedBuffer = Buffer.from(providedSig);
    const expectedBuffer = Buffer.from(expectedSig);
    if (providedBuffer.length !== expectedBuffer.length) return false;
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) return false;

    const expiresAt = Number(payload.split('.')[1]);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    return true;
}

export async function isAuthenticated() {
    const secret = getSessionSecret();
    if (!secret) return false;

    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return verifySessionToken(session?.value, secret);
}

function secureCompare(value: string, expected: string) {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    if (valueBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(valueBuffer, expectedBuffer);
}

export async function login(password: string, username: string) {
    const { adminUser, adminPassword } = getAdminCredentials();

    if (secureCompare(username, adminUser) && secureCompare(password, adminPassword)) {
        const secret = getSessionSecret();
        if (!secret) return false;

        const cookieStore = await cookies();
        // 签名会话 token，无法被伪造
        cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(secret), {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true', // 仅在明确配置为 HTTPS 时启用 secure
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE_MS / 1000, // 24 hours
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
