import * as React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon?: React.ReactNode
  description?: string
  trend?: string
  trendType?: "positive" | "negative" | "neutral"
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, icon, description, trend, trendType = "neutral", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card rounded-xl shadow-sm border border-border p-4 hover:shadow-md transition-all duration-300 hover:scale-105 touch-manipulation",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-light text-muted-foreground">{title}</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
              {icon && (
                <div className="text-muted-foreground/60 ml-2">
                  {icon}
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className={cn(
              "text-xs font-medium",
              trendType === "positive" && "text-green-600",
              trendType === "negative" && "text-red-600",
              trendType === "neutral" && "text-muted-foreground"
            )}>
              {trend}
            </span>
          </div>
        )}
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }