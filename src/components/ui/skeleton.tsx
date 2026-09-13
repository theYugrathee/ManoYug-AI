import { cn } from "@/lib/cn";

type SkeletonProps = {
    className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
    return <div className={cn("my-skeleton h-4 w-full", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
    return (
        <div className={cn("rounded-xl border border-border bg-elevated p-5 space-y-3", className)}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-40" />
        </div>
    );
}

export function SkeletonRow({ className }: SkeletonProps) {
    return (
        <div className={cn("flex items-center gap-4 py-3", className)}>
            <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20 flex-shrink-0" />
        </div>
    );
}
