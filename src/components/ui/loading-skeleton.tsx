import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted", className)}
      {...props}
    />
  );
}

// Skeleton específico para cards
function CardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("p-6 space-y-4", className)} {...props}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

// Skeleton para estatísticas
function StatsSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", className)} {...props}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para lista
function ListSkeleton({ items = 5, className, ...props }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para tabela
function TableSkeleton({ rows = 5, cols = 4, className, ...props }: SkeletonProps & { rows?: number; cols?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton para dashboard
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Stats Grid */}
      <StatsSkeleton />
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton className="h-64" />
        </div>
        <div className="space-y-4">
          <CardSkeleton className="h-32" />
          <CardSkeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para portal do aluno
function PortalSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      </div>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-32" />
        </div>
        <div className="space-y-6">
          <CardSkeleton className="h-56" />
          <CardSkeleton className="h-40" />
          <CardSkeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  StatsSkeleton,
  ListSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  PortalSkeleton
};