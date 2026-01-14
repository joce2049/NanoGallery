
import { login } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password, username } = body;

        if (!password || !username) {
            return NextResponse.json({ error: "Username and password required" }, { status: 400 });
        }

        const success = await login(password, username);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
