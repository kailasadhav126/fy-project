import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-0 px-3 py-1 text-xs font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-orange-100 text-orange-700 hover:bg-orange-200",
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200",
        destructive:
          "bg-red-100 text-red-700 hover:bg-red-200",
        outline: "border-2 border-gray-300 bg-white text-gray-700 hover:border-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
