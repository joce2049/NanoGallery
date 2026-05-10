import { appDefaults, siteConfig } from "@/config"

export type RuntimeSettings = {
    site: {
        name: string
        description: string
        metadataTitle: string
        metadataDescription: string
        copyrightText: string
        adminName: string
        adminTitle: string
    }
    upload: {
        maxUploadSizeMB: number
        maxDimension: number
        thumbnailDimension: number
        webpQuality: number
        thumbnailQuality: number
    }
    prompt: {
        lockedContentMessage: string
    }
}

export const defaultRuntimeSettings: RuntimeSettings = {
    site: {
        name: siteConfig.name,
        description: siteConfig.description,
        metadataTitle: siteConfig.metadata.title,
        metadataDescription: siteConfig.metadata.description,
        copyrightText: siteConfig.copyright.text,
        adminName: siteConfig.admin.name,
        adminTitle: siteConfig.admin.title,
    },
    upload: {
        maxUploadSizeMB: Math.round(appDefaults.upload.maxUploadSize / 1024 / 1024),
        maxDimension: appDefaults.upload.maxDimension,
        thumbnailDimension: appDefaults.upload.thumbnailDimension,
        webpQuality: appDefaults.upload.webpQuality,
        thumbnailQuality: appDefaults.upload.thumbnailQuality,
    },
    prompt: {
        lockedContentMessage: "该作品的 Prompt 内容暂未公开，您仍可以参考图片、标签和模型信息获取灵感。",
    },
}

export type PublicRuntimeSettings = RuntimeSettings & {
    upload: RuntimeSettings["upload"] & {
        allowedTypes: readonly string[]
        maxUploadSize: number
    }
}
