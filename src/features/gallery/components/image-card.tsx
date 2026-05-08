"use client"

import Image from "next/image"
import { Card } from "@/shared/ui/card"
import type { Prompt } from "@/core/types"
import { getPromptPreviewUrl } from "@/shared/lib/utils"
import { Eye } from "lucide-react"
import { useState } from "react"

interface ImageCardProps {
  prompt: Prompt
  onCardClick?: () => void
}

export function ImageCard({ prompt, onCardClick }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Card
      className="group overflow-hidden border-border/50 bg-card hover:border-accent/50 transition-all duration-300 cursor-pointer rounded-lg p-0"
      onClick={onCardClick}
    >
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-muted via-muted/70 to-background" />
        )}
        <Image
          src={getPromptPreviewUrl(prompt)}
          alt={prompt.title}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className={`w-full h-auto transition-all duration-300 group-hover:scale-105 block ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ width: '100%', height: 'auto' }}
          onLoad={() => setLoaded(true)}
        />
        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Eye className="h-3.5 w-3.5" />
          {prompt.views || 0}
        </div>
      </div>
    </Card>
  )
}
