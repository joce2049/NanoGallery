type LoginAttempt = {
    count: number
    lockedUntil: number
    updatedAt: number
}

const attempts = new Map<string, LoginAttempt>()

const ATTEMPT_WINDOW_MS = 10 * 60 * 1000
const LOCK_MS = 10 * 60 * 1000
const MAX_FAILURES = 5

function cleanup() {
    const now = Date.now()

    for (const [key, attempt] of attempts.entries()) {
        if (attempt.lockedUntil <= now && now - attempt.updatedAt > ATTEMPT_WINDOW_MS) {
            attempts.delete(key)
        }
    }
}

export function getLoginKey(request: Request, username?: string) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    const realIp = request.headers.get("x-real-ip")?.trim()
    const ip = forwarded || realIp || "local"
    return `${ip}:${(username || "").trim().toLowerCase()}`
}

export function getLoginLock(key: string) {
    cleanup()
    const attempt = attempts.get(key)
    if (!attempt || attempt.lockedUntil <= Date.now()) return null

    return {
        retryAfterSeconds: Math.ceil((attempt.lockedUntil - Date.now()) / 1000),
    }
}

export function recordLoginFailure(key: string) {
    cleanup()

    const now = Date.now()
    const current = attempts.get(key)
    const withinWindow = current && now - current.updatedAt <= ATTEMPT_WINDOW_MS
    const count = withinWindow ? current.count + 1 : 1
    const lockedUntil = count >= MAX_FAILURES ? now + LOCK_MS : 0

    attempts.set(key, {
        count,
        lockedUntil,
        updatedAt: now,
    })
}

export function recordLoginSuccess(key: string) {
    attempts.delete(key)
}
