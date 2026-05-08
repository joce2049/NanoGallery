import { NextResponse } from "next/server"
import { getTurnstilePublicConfig } from "@/server/turnstile"

export async function GET() {
    return NextResponse.json(getTurnstilePublicConfig())
}
