"use client"

import { useEffect, useRef, useState } from "react"

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string
                    callback: (token: string) => void
                    "expired-callback": () => void
                    "error-callback": (errorCode?: string | number) => boolean | void
                    theme?: "light" | "dark" | "auto"
                }
            ) => string
            reset: (widgetId?: string) => void
            remove: (widgetId: string) => void
        }
    }
}

type TurnstileConfig = {
    siteKey: string
    enabled: boolean
}

interface TurnstileWidgetProps {
    onTokenChange: (token: string) => void
    resetSignal?: number
    className?: string
}

let turnstileScriptPromise: Promise<void> | null = null

function waitForTurnstileGlobal(resolve: () => void, reject: (error: Error) => void) {
    let settled = false
    let attempts = 0

    const finish = (callback: () => void) => {
        if (settled) return
        settled = true
        window.clearInterval(timer)
        callback()
    }

    const timer = window.setInterval(() => {
        if (window.turnstile) {
            finish(resolve)
            return
        }

        attempts += 1
        if (attempts >= 150) {
            finish(() => reject(new Error("Turnstile script did not initialize")))
        }
    }, 100)
}

function loadTurnstileScript() {
    if (typeof window === "undefined") return Promise.resolve()
    if (window.turnstile) return Promise.resolve()
    if (turnstileScriptPromise) return turnstileScriptPromise

    turnstileScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]")
        if (existing) {
            if (window.turnstile) {
                resolve()
                return
            }

            existing.addEventListener("load", () => waitForTurnstileGlobal(resolve, reject), { once: true })
            existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load")), { once: true })
            waitForTurnstileGlobal(resolve, reject)
            return
        }

        const script = document.createElement("script")
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        script.async = true
        script.defer = true
        script.dataset.turnstile = "true"
        script.onload = () => waitForTurnstileGlobal(resolve, reject)
        script.onerror = () => reject(new Error("Turnstile script failed to load"))
        document.head.appendChild(script)
    })

    return turnstileScriptPromise
}

function getTurnstileErrorMessage(errorCode?: string | number) {
    const code = String(errorCode ?? "")

    if (code.startsWith("110200")) {
        return "当前域名未加入 Cloudflare Turnstile 允许列表"
    }

    if (code.startsWith("110100") || code.startsWith("110110") || code.startsWith("400020")) {
        return "Cloudflare Turnstile Site Key 配置错误"
    }

    if (code.startsWith("400070")) {
        return "Cloudflare Turnstile Site Key 已停用"
    }

    return "人机验证加载失败，请刷新后重试"
}

export function TurnstileWidget({ onTokenChange, resetSignal, className }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<string>("")
    const [config, setConfig] = useState<TurnstileConfig | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        fetch("/api/auth/turnstile", { cache: "no-store" })
            .then((res) => res.ok ? res.json() : null)
            .then((data: TurnstileConfig | null) => {
                setConfig(data)
                if (!data?.enabled) {
                    setError("Cloudflare Turnstile 尚未配置")
                }
            })
            .catch(() => setError("无法加载人机验证配置"))
    }, [])

    useEffect(() => {
        if (!config?.enabled || !config.siteKey || !containerRef.current || widgetIdRef.current) return

        let cancelled = false

        loadTurnstileScript()
            .then(() => {
                if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current) return

                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: config.siteKey,
                    theme: "auto",
                    callback: (token) => {
                        setError("")
                        onTokenChange(token)
                    },
                    "expired-callback": () => {
                        onTokenChange("")
                    },
                    "error-callback": (errorCode) => {
                        onTokenChange("")
                        setError(getTurnstileErrorMessage(errorCode))
                        return true
                    },
                })
            })
            .catch(() => setError("无法加载 Cloudflare Turnstile"))

        return () => {
            cancelled = true
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current)
                widgetIdRef.current = ""
            }
        }
    }, [config, onTokenChange])

    useEffect(() => {
        if (widgetIdRef.current && window.turnstile) {
            onTokenChange("")
            window.turnstile.reset(widgetIdRef.current)
        }
    }, [resetSignal, onTokenChange])

    return (
        <div className={className}>
            <div ref={containerRef} className="min-h-[65px]" />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    )
}
