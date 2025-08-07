import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const actionButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm rounded-lg",
        secondary: "border-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground rounded-lg",
        outline: "border border-border text-foreground bg-card hover:bg-muted rounded-lg",
        ghost: "text-foreground hover:bg-muted rounded-lg",
        danger: "bg-red-500 text-white hover:bg-red-600 rounded-lg",
      },
      size: {
        sm: "h-9 px-3 text-sm min-h-[36px]",
        md: "h-11 px-5 text-base min-h-[44px]",
        lg: "h-12 px-6 text-lg min-h-[48px]",
        icon: "h-11 w-11 min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(actionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </Comp>
    )
  }
)
ActionButton.displayName = "ActionButton"

export { ActionButton, actionButtonVariants }