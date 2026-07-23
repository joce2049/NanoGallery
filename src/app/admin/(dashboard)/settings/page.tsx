"use client"

import { useEffect, useState } from "react"
import { Save, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { AdminPanel } from "@/features/admin/components/admin-panel"
import { defaultPublicRuntimeSettings } from "@/shared/lib/use-runtime-settings"
import type { PublicRuntimeSettings } from "@/core/settings"
import { toast } from "sonner"

export default function SettingsPage() {
    const [settings, setSettings] = useState<PublicRuntimeSettings>(defaultPublicRuntimeSettings)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch("/api/settings", { cache: "no-store" })
            .then((res) => res.ok ? res.json() : defaultPublicRuntimeSettings)
            .then((data: PublicRuntimeSettings) => setSettings(data))
            .catch(() => setSettings(defaultPublicRuntimeSettings))
            .finally(() => setLoading(false))
    }, [])

    const updateSite = (key: keyof PublicRuntimeSettings["site"], value: string) => {
        setSettings((current) => ({ ...current, site: { ...current.site, [key]: value } }))
    }

    const updateUpload = (key: keyof PublicRuntimeSettings["upload"], value: string) => {
        setSettings((current) => ({ ...current, upload: { ...current.upload, [key]: Number(value) } }))
    }

    const updatePrompt = (key: keyof PublicRuntimeSettings["prompt"], value: string) => {
        setSettings((current) => ({ ...current, prompt: { ...current.prompt, [key]: value } }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            const data = await res.json().catch(() => null)
            if (!res.ok) throw new Error(data?.error || "保存失败")
            setSettings(data)
            toast.success("设置已保存")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "保存失败")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="text-muted-foreground">正在加载设置...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <SettingsIcon className="h-6 w-6" />
                        站点设置
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">这些设置保存在本地数据仓库，不会被代码更新覆盖。</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "保存中..." : "保存设置"}
                </Button>
            </div>

            <AdminPanel title="站点信息" description="用于首页、侧边栏、SEO 和后台标题" bodyClassName="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="site-name">网站名称</Label>
                        <Input id="site-name" value={settings.site.name} onChange={(e) => updateSite("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-name">后台名称</Label>
                        <Input id="admin-name" value={settings.site.adminName} onChange={(e) => updateSite("adminName", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="site-description">网站简介</Label>
                        <Textarea id="site-description" value={settings.site.description} onChange={(e) => updateSite("description", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="metadata-title">SEO 标题</Label>
                        <Input id="metadata-title" value={settings.site.metadataTitle} onChange={(e) => updateSite("metadataTitle", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="copyright-text">版权文案</Label>
                        <Input id="copyright-text" value={settings.site.copyrightText} onChange={(e) => updateSite("copyrightText", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="metadata-description">SEO 描述</Label>
                        <Textarea id="metadata-description" value={settings.site.metadataDescription} onChange={(e) => updateSite("metadataDescription", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="admin-title">后台登录说明</Label>
                        <Input id="admin-title" value={settings.site.adminTitle} onChange={(e) => updateSite("adminTitle", e.target.value)} />
                    </div>
                </div>
            </AdminPanel>

            <AdminPanel title="Prompt 显示" description="控制前台作品中 Prompt 内容不可公开时的提示文案">
                <div className="space-y-2">
                    <Label htmlFor="locked-content-message">不公开提示文案</Label>
                    <Textarea id="locked-content-message" value={settings.prompt.lockedContentMessage} onChange={(e) => updatePrompt("lockedContentMessage", e.target.value)} />
                </div>
            </AdminPanel>

            <AdminPanel title="图片压缩" description="控制上传后的主图和缩略图体积，数值越高画质越好、文件越大">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="max-upload-size">最大上传大小 MB</Label>
                        <Input id="max-upload-size" type="number" min={1} max={100} value={settings.upload.maxUploadSizeMB} onChange={(e) => updateUpload("maxUploadSizeMB", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="max-dimension">主图最长边 px</Label>
                        <Input id="max-dimension" type="number" min={512} max={8000} value={settings.upload.maxDimension} onChange={(e) => updateUpload("maxDimension", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="thumb-dimension">缩略图最长边 px</Label>
                        <Input id="thumb-dimension" type="number" min={128} max={2000} value={settings.upload.thumbnailDimension} onChange={(e) => updateUpload("thumbnailDimension", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="webp-quality">主图 WebP 质量</Label>
                        <Input id="webp-quality" type="number" min={50} max={100} value={settings.upload.webpQuality} onChange={(e) => updateUpload("webpQuality", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="thumb-quality">缩略图 WebP 质量</Label>
                        <Input id="thumb-quality" type="number" min={40} max={100} value={settings.upload.thumbnailQuality} onChange={(e) => updateUpload("thumbnailQuality", e.target.value)} />
                    </div>
                </div>
            </AdminPanel>
        </div>
    )
}
