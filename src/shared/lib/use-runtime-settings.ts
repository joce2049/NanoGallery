"use client"

import { useEffect, useState } from "react"
import { defaultRuntimeSettings, type PublicRuntimeSettings } from "@/core/settings"
import { appDefaults } from "@/config"

export const defaultPublicRuntimeSettings: PublicRuntimeSettings = {
    ...defaultRuntimeSettings,
    upload: {
        ...defaultRuntimeSettings.upload,
        allowedTypes: appDefaults.upload.allowedTypes,
        maxUploadSize: defaultRuntimeSettings.upload.maxUploadSizeMB * 1024 * 1024,
    },
}

export function useRuntimeSettings(initialSettings?: PublicRuntimeSettings) {
    const [settings, setSettings] = useState<PublicRuntimeSettings>(initialSettings || defaultPublicRuntimeSettings)

    useEffect(() => {
        if (initialSettings) return

        fetch("/api/settings", { cache: "no-store" })
            .then((res) => res.ok ? res.json() : null)
            .then((data: PublicRuntimeSettings | null) => {
                if (data) setSettings(data)
            })
            .catch(() => undefined)
    }, [initialSettings])

    return settings
}
