"use client"

import Image from "next/image"
import { Card } from "@/shared/ui/card"
import type { Prompt } from "@/core/types"
import { getPromptPreviewUrl } from "@/shared/lib/utils"
import { Eye, ImageOff } from "lucide-react"
import { useState, type SyntheticEvent } from "react"

interface ImageCardProps {
  prompt: Prompt
  onCardClick?: () => void
}

export function ImageCard({ prompt, onCardClick }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [naturalRatio, setNaturalRatio] = useState<string>()

  // 先用管理员填写的比例预留空间，图片加载后切换为真实比例，避免留白或静态裁切。
  const metadataRatio = prompt.metadata?.aspectRatio?.includes(":")
    ? prompt.metadata.aspectRatio.replace(":", " / ")
    : undefined
  const displayRatio = naturalRatio || metadataRatio

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    if (metadataRatio && image.naturalWidth > 0 && image.naturalHeight > 0) {
      setNaturalRatio(`${image.naturalWidth} / ${image.naturalHeight}`)
    }
    setLoaded(true)
  }

  const handleError = () => {
    setFailed(true)
    setLoaded(true)
  }

  return (
    <Card
      className="group overflow-hidden border-border/50 bg-card hover:border-accent/50 transition-[border-color] duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] cursor-pointer rounded-lg p-0"
      onClick={onCardClick}
    >
      <div
        className={`t-skel w-full bg-muted/20 ${loaded ? "is-revealed" : ""}`}
        style={displayRatio ? { aspectRatio: displayRatio } : undefined}
      >
        {/* 骨架与图片同槽交叉：骨架淡出加模糊、图片淡入去模糊，共用一套时长与缓动。
            骨架在揭示后仍留在 DOM 里承接淡出，故必须 pointer-events-none。 */}
        {!failed && (
          <div className="t-skel-skeleton is-pulsing pointer-events-none absolute inset-0 z-10" aria-hidden="true">
            <div className="h-full w-full bg-gradient-to-br from-muted via-muted/70 to-background" />
          </div>
        )}

        {failed ? (
          <div
            className={`flex flex-col items-center justify-center gap-2 bg-muted/40 p-4 text-center text-muted-foreground ${displayRatio ? "absolute inset-0" : "min-h-[160px] w-full"}`}
          >
            <ImageOff className="h-6 w-6" />
            <span className="line-clamp-2 text-xs">{prompt.title}</span>
          </div>
        ) : metadataRatio ? (
          <Image
            src={getPromptPreviewUrl(prompt)}
            alt={prompt.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            className="t-skel-content t-hover-media object-contain group-hover:scale-105"
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <Image
            src={getPromptPreviewUrl(prompt)}
            alt={prompt.title}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            className="t-skel-content t-hover-media w-full h-auto object-contain group-hover:scale-105 block"
            style={{ width: '100%', height: 'auto' }}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}

        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-smooth-out)] group-hover:opacity-100 z-20">
          <Eye className="h-3.5 w-3.5" />
          {prompt.views || 0}
        </div>
      </div>
    </Card>
  )
}
