"use client"

import { useEffect, useRef, useState } from "react"
import { ImageCard } from "./image-card"
import type { Prompt } from "@/lib/types"

interface Image {
  id: number
  src: string
  title: string
  prompt: string
  likes: number
  width?: number
  height?: number
}

interface MasonryGalleryProps {
  images: Image[]
}

export function MasonryGallery({ images }: MasonryGalleryProps) {
  const [columns, setColumns] = useState(4)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) {
        setColumns(1)
      } else if (width < 768) {
        setColumns(2)
      } else if (width < 1024) {
        setColumns(3)
      } else {
        setColumns(4)
      }
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  // 将图片分配到各列
  const columnArrays: Image[][] = Array.from({ length: columns }, () => [])
  images.forEach((image, index) => {
    columnArrays[index % columns].push(image)
  })

  return (
    <div ref={containerRef} className="flex gap-4">
      {columnArrays.map((columnImages, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-4">
          {columnImages.map((image) => (
            <ImageCard
              key={image.id}
              prompt={{
                id: String(image.id),
                title: image.title,
                content: image.prompt,
                imageUrl: image.src || "/placeholder.svg",
                tags: [],
                status: "published",
                views: 0,
                copies: 0,
                likes: image.likes,
                createdAt: new Date(),
                updatedAt: new Date(),
              } satisfies Prompt}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
