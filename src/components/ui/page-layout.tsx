import * as React from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  actions?: React.ReactNode
  maxWidth?: "4xl" | "6xl" | "7xl" | "full"
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ className, title, description, actions, maxWidth = "6xl", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-background",
          className
        )}
        {...props}
      >
        <div className={cn(
          "mx-auto w-full px-4 py-6",
          maxWidth === "4xl" && "max-w-4xl",
          maxWidth === "6xl" && "max-w-6xl",
          maxWidth === "7xl" && "max-w-7xl",
          maxWidth === "full" && "max-w-full"
        )}>
          {(title || description || actions) && (
            <div className="mb-6 pb-4 border-b border-border">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  {title && (
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground font-inter">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-base font-light text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex flex-wrap gap-2">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    )
  }
)
PageLayout.displayName = "PageLayout"

const PageSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-6 space-y-4", className)}
        {...props}
      />
    )
  }
)
PageSection.displayName = "PageSection"

const PageGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  cols?: 1 | 2 | 3 | 4
}>(
  ({ className, cols = 3, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4 w-full",
          cols === 1 && "grid-cols-1",
          cols === 2 && "grid-cols-1 md:grid-cols-2",
          cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className
        )}
        {...props}
      />
    )
  }
)
PageGrid.displayName = "PageGrid"

export { PageLayout, PageSection, PageGrid }