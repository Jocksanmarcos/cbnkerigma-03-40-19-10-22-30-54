import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const MobileTabs = TabsPrimitive.Root

interface MobileTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  maxTabsPerRow?: number
}

const MobileTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  MobileTabsListProps
>(({ className, maxTabsPerRow = 3, children, ...props }, ref) => {
  const tabsArray = React.Children.toArray(children)
  const rows = []
  
  for (let i = 0; i < tabsArray.length; i += maxTabsPerRow) {
    rows.push(tabsArray.slice(i, i + maxTabsPerRow))
  }

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <TabsPrimitive.List
          key={rowIndex}
          ref={rowIndex === 0 ? ref : undefined}
          className={cn(
            "inline-flex w-full h-12 items-center justify-center rounded-xl bg-gradient-to-r from-muted/90 via-muted/80 to-muted/90 p-1 text-muted-foreground shadow-sm border border-border/20 backdrop-blur-sm",
            className
          )}
          {...(rowIndex === 0 ? props : {})}
        >
          {row}
        </TabsPrimitive.List>
      ))}
    </div>
  )
})
MobileTabsList.displayName = "MobileTabsList"

const MobileTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:via-primary/95 data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=active]:scale-105 data-[state=active]:border data-[state=active]:border-primary/20",
      "hover:bg-gradient-to-br hover:from-primary/15 hover:via-primary/10 hover:to-primary/15 hover:text-primary hover:scale-[1.02] hover:shadow-sm",
      "flex-1 min-h-[40px] active:scale-95 gap-1",
      className
    )}
    {...props}
  />
))
MobileTabsTrigger.displayName = "MobileTabsTrigger"

const MobileTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "animate-in fade-in-50 duration-300",
      className
    )}
    {...props}
  />
))
MobileTabsContent.displayName = "MobileTabsContent"

export { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent }