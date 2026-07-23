"use client"

import { useRef, useState } from "react"
import { Download, Upload, Loader2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

/** 后台数据导出/导入（完整备份 JSON）。 */
export function ImportExportButtons() {
    const router = useRouter()
    const fileRef = useRef<HTMLInputElement>(null)
    const [importing, setImporting] = useState(false)

    const handleExport = () => {
        // 导出端点带 Content-Disposition，浏览器直接下载不跳转
        window.location.href = "/api/admin/export"
    }

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return

        setImporting(true)
        try {
            const data = JSON.parse(await file.text())
            const res = await fetch("/api/admin/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            const result = await res.json().catch(() => null)
            if (!res.ok) throw new Error(result?.error || "导入失败")
            const im = result.imported
            toast.success(`导入完成：${im.prompts} 个 Prompt · ${im.categories} 分类 · ${im.tags} 标签`)
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "导入失败，请检查 JSON 格式")
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                导出
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                导入
            </Button>
        </div>
    )
}
