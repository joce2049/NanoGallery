"use client"

import { Button } from "@/components/ui/button"
import { getAllCategories } from "@/lib/data-utils"

interface CategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories = getAllCategories()
  const allCategories = ["全部", ...categories.map(c => c.name)]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          className={`whitespace-nowrap ${selectedCategory === category ? "bg-accent text-accent-foreground" : "border-border hover:border-accent/50"
            }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
