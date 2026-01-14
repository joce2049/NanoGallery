
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Lock, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoginModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })

            if (res.ok) {
                router.push("/admin")
                router.refresh()
                onOpenChange(false)
            } else {
                setError("用户名或密码错误")
            }
        } catch (err) {
            setError("登录失败，请重试")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] border-none bg-black/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 dark:ring-white/5 p-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

                <div className="relative p-6 space-y-6">
                    <DialogHeader className="items-center text-center space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="h-6 w-6 text-white" />
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
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="modal-username" className="text-xs font-medium text-zinc-400 ml-1">
                                    账号
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-2.5 text-zinc-500 transition-colors group-focus-within:text-purple-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="modal-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-purple-500/50 transition-all rounded-xl"
                                        placeholder="请输入管理员账号"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="modal-password" className="text-xs font-medium text-zinc-400 ml-1">
                                    密码
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-2.5 text-zinc-500 transition-colors group-focus-within:text-purple-400">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="modal-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:bg-white/10 focus:border-purple-500/50 transition-all rounded-xl"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
