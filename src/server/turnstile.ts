export type TurnstilePublicConfig = {
    siteKey: string
    enabled: boolean
}

type TurnstileVerifyResponse = {
    success: boolean
    "error-codes"?: string[]
    challenge_ts?: string
    hostname?: string
    action?: string
    cdata?: string
}

export function getTurnstilePublicConfig(): TurnstilePublicConfig {
    const siteKey = process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
    const secretKey = process.env.TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || ""

    return {
        siteKey,
        enabled: Boolean(siteKey && secretKey),
    }
}

function getTurnstileSecretKey() {
    return process.env.TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || ""
}

function getRemoteIp(request: Request) {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")?.trim()
        || ""
}

export async function verifyTurnstileToken(token: unknown, request: Request) {
    const secretKey = getTurnstileSecretKey()
    const siteKey = getTurnstilePublicConfig().siteKey

    if (!siteKey || !secretKey) {
        return {
            success: false,
            error: "Turnstile is not configured",
        }
    }

    if (typeof token !== "string" || !token.trim()) {
        return {
            success: false,
            error: "Turnstile token is required",
        }
    }

    const formData = new FormData()
    formData.append("secret", secretKey)
    formData.append("response", token)

    const remoteIp = getRemoteIp(request)
    if (remoteIp) {
        formData.append("remoteip", remoteIp)
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
    })

    const data = await response.json() as TurnstileVerifyResponse

    return {
        success: Boolean(response.ok && data.success),
        error: data["error-codes"]?.join(", ") || undefined,
    }
}
