
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

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
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>管理员登录</DialogTitle>
                    <DialogDescription>
                        请输入管理员账号和密码以继续
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="modal-username">账号</Label>
                        <Input
                            id="modal-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-background/50 backdrop-blur-sm"
                            placeholder="请输入账号"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modal-password">密码</Label>
                        <Input
                            id="modal-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-background/50 backdrop-blur-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            取消
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            登录
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
