
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import { Loader2, Sparkles, Lock, User } from "lucide-react"
import { TurnstileWidget } from "@/features/auth/components/turnstile-widget"
import { replayAnimation } from "@/shared/lib/motion"

interface LoginModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [turnstileToken, setTurnstileToken] = useState("")
    const [turnstileEnabled, setTurnstileEnabled] = useState(true)
    const [turnstileResetSignal, setTurnstileResetSignal] = useState(0)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const credentialsRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // 登录失败：错误文案揭示 + 凭据区抖动。抖动必须走 replayAnimation，否则连续两次
    // 同样的错误不会重跑关键帧。
    const failLogin = (message: string) => {
        setError(message)
        setTurnstileResetSignal((value) => value + 1)
        replayAnimation(credentialsRef.current, "is-shaking")
    }

    const handleTurnstileStatus = useCallback(({ enabled }: { enabled: boolean }) => {
        setTurnstileEnabled(enabled)
    }, [])

    useEffect(() => {
        if (open) {
            setTurnstileToken("")
            setTurnstileResetSignal((value) => value + 1)
        }
    }, [open])

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
                onOpenChange(false)
            } else {
                const data = await res.json().catch(() => ({}))
                failLogin(data.retryAfterSeconds ? `尝试过多，请 ${data.retryAfterSeconds} 秒后再试` : "登录信息或人机验证错误")
            }
        } catch {
            failLogin("登录失败，请重试")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] border-none bg-black/20 text-white backdrop-blur-xl shadow-2xl ring-1 ring-white/10 dark:ring-white/5 p-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-slate-200/8 to-cyan-100/14 pointer-events-none" />

                <div className="relative p-6 space-y-6">
                    <DialogHeader className="items-center text-center space-y-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white via-slate-200 to-cyan-100 flex items-center justify-center shadow-lg shadow-cyan-100/20">
                            <Sparkles className="h-6 w-6 text-slate-900" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                                欢迎回来
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                请输入您的管理员账号以继续
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div ref={credentialsRef} className="t-shake space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="modal-username" className="text-xs font-medium text-zinc-400 ml-1">
                                    账号
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-2.5 text-zinc-500 transition-colors group-focus-within:text-cyan-100">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="modal-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-cyan-100/60 transition-[color,box-shadow,background-color,border-color] duration-[var(--duration-quick)] ease-[var(--ease-smooth-out)] rounded-xl"
                                        placeholder="请输入管理员账号"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="modal-password" className="text-xs font-medium text-zinc-400 ml-1">
                                    密码
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-2.5 text-zinc-500 transition-colors group-focus-within:text-cyan-100">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="modal-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-cyan-100/60 transition-[color,box-shadow,background-color,border-color] duration-[var(--duration-quick)] ease-[var(--ease-smooth-out)] rounded-xl"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <TurnstileWidget
                                onTokenChange={setTurnstileToken}
                                onStatusChange={handleTurnstileStatus}
                                resetSignal={turnstileResetSignal}
                            />
                        </div>

                        {error && (
                            <div className="t-error-msg text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={loading || (turnstileEnabled && !turnstileToken)}
                                className="w-full h-10 bg-gradient-to-r from-slate-200 via-white to-cyan-100 hover:from-white hover:via-slate-100 hover:to-cyan-50 text-slate-950 border-0 shadow-lg shadow-cyan-100/20 rounded-xl transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        验证中...
                                    </>
                                ) : "登 录"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
