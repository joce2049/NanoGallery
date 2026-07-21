
"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Label } from "@/shared/ui/label"
import { Lock } from "lucide-react"
import { TurnstileWidget } from "@/features/auth/components/turnstile-widget"

export default function AdminLogin() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [turnstileToken, setTurnstileToken] = useState("")
    const [turnstileEnabled, setTurnstileEnabled] = useState(true)
    const [turnstileResetSignal, setTurnstileResetSignal] = useState(0)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleTurnstileStatus = useCallback(({ enabled }: { enabled: boolean }) => {
        setTurnstileEnabled(enabled)
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, turnstileToken }),
            })

            if (res.ok) {
                router.push("/admin")
                router.refresh()
            } else {
                const data = await res.json().catch(() => ({}))
                setError(data.retryAfterSeconds ? `尝试过多，请 ${data.retryAfterSeconds} 秒后再试` : "登录信息或人机验证错误")
                setTurnstileResetSignal((value) => value + 1)
            }
        } catch {
            setError("登录失败，请重试")
            setTurnstileResetSignal((value) => value + 1)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-zinc-800 p-3 rounded-full w-fit">
                        <Lock className="w-6 h-6 text-zinc-400" />
                    </div>
                    <CardTitle className="text-2xl">管理员登录</CardTitle>
                    <CardDescription className="text-zinc-400">
                        请输入管理员账号和密码以继续
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">账号</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-zinc-700"
                                placeholder="admin"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-zinc-700"
                                placeholder="••••••••"
                            />
                        </div>
                        <TurnstileWidget
                            onTokenChange={setTurnstileToken}
                            onStatusChange={handleTurnstileStatus}
                            resetSignal={turnstileResetSignal}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-zinc-200"
                            disabled={loading || (turnstileEnabled && !turnstileToken)}
                        >
                            {loading ? "登录中..." : "登录"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
