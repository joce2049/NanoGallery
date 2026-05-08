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
}

export type PublicRuntimeSettings = RuntimeSettings & {
    upload: RuntimeSettings["upload"] & {
        allowedTypes: readonly string[]
        maxUploadSize: number
    }
}
