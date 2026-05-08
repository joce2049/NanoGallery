
import { login } from "@/server/auth";
import { getLoginKey, getLoginLock, recordLoginFailure, recordLoginSuccess } from "@/server/login-attempts";
import { verifyTurnstileToken } from "@/server/turnstile";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password, username, turnstileToken } = body;

        if (!password || !username) {
            return NextResponse.json({ error: "Username and password required" }, { status: 400 });
        }

        const key = getLoginKey(request, username);
        const lock = getLoginLock(key);
        if (lock) {
            return NextResponse.json(
                { error: "Too many failed attempts", retryAfterSeconds: lock.retryAfterSeconds },
                { status: 429 }
            );
        }

        const turnstile = await verifyTurnstileToken(turnstileToken, request);
        if (!turnstile.success) {
            recordLoginFailure(key);
            return NextResponse.json({ error: "Turnstile verification failed" }, { status: 400 });
        }

        const success = await login(password, username);

        if (success) {
            recordLoginSuccess(key);
            return NextResponse.json({ success: true });
        } else {
            recordLoginFailure(key);
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
