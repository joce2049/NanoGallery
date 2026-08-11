"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/shared/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // 避免水合不匹配
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <div className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {/* 两枚图标常驻同一个 grid 格子做交叉切换；条件渲染会整个换掉元素，过渡无从谈起 */}
            <span className="t-icon-swap" data-state={theme === "dark" ? "b" : "a"}>
                <Moon data-icon="a" className="t-icon h-5 w-5" />
                <Sun data-icon="b" className="t-icon h-5 w-5" />
            </span>
            <span className="sr-only">切换主题</span>
        </Button>
    )
}
