"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import type { Prompt } from "@/lib/types"
import { getImageUrl } from "@/lib/utils"

interface ImageCardProps {
  prompt: Prompt
  onCardClick?: () => void
}

export function ImageCard({ prompt, onCardClick }: ImageCardProps) {
  return (
    <Card
      className="group overflow-hidden border-border/50 bg-card hover:border-accent/50 transition-all duration-300 cursor-pointer rounded-lg p-0"
      onClick={onCardClick}
    >
      <div className="relative">
        <Image
          src={getImageUrl(prompt.imageUrl)}
          alt={prompt.title}
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          className="w-full h-auto transition-transform duration-300 group-hover:scale-105 block"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </Card>
  )
}
