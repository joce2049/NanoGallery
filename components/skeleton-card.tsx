import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function SkeletonCard() {
    return (
        <Card className="masonry-item overflow-hidden border-border/50">
            <Skeleton className="w-full aspect-[4/5]" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </Card>
    )
}
