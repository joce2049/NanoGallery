import { NextResponse } from "next/server"
import { isAuthenticated } from "@/server/auth"
import { getRuntimeSettings, saveRuntimeSettings, toPublicRuntimeSettings } from "@/server/settings"

export async function GET() {
    const settings = await getRuntimeSettings()
    return NextResponse.json(toPublicRuntimeSettings(settings))
}

export async function PUT(request: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const settings = await saveRuntimeSettings(body)
        return NextResponse.json(toPublicRuntimeSettings(settings))
    } catch (error) {
        console.error("[Settings API] Failed to save settings:", error)
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }
}
