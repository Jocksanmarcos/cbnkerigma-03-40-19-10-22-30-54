import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm rounded-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg",
        outline:
          "border-2 border-primary text-primary bg-card hover:bg-primary hover:text-primary-foreground rounded-lg",
        secondary:
          "border border-border text-foreground bg-card hover:bg-muted rounded-lg",
        neutral:
          "bg-neutral text-neutral-foreground hover:bg-neutral/80 rounded-lg",
        ghost: "text-foreground hover:bg-muted rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        whatsapp: "bg-whatsapp text-primary-foreground hover:bg-whatsapp/90 rounded-lg",
      },
      size: {
        default: "h-11 px-5 text-base min-h-[44px]",
        sm: "h-9 px-3 text-sm min-h-[36px]",
        lg: "h-12 px-6 text-lg min-h-[48px]",
        icon: "h-11 w-11 min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
