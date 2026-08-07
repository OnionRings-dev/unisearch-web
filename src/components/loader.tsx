"use client"

import { cn } from "@/lib/utils"

export interface LoaderProps {
  variant?:
  | "circular"
  | "text-shimmer"
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function CircularLoader({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  }

  return (
    <div
      className={cn(
        "border-primary animate-spin rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Loading</span>
    </div>
  )
}

export function TextShimmerLoader({
  text = "Thinking",
  className,
  size = "md",
}: {
  text?: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div
      className={cn(
        "bg-[linear-gradient(to_right,var(--muted-foreground)_20%,var(--foreground)_80%,var(--muted-foreground)_100%)]",
        "bg-size-[300%_auto] bg-clip-text font-medium text-transparent",
        "animate-[shimmer_3.5s_infinite_linear]",
        textSizes[size],
        className
      )}
    >
      {text}
    </div>
  )
}

function Loader({
  variant = "circular",
  size = "md",
  text,
  className,
}: LoaderProps) {
  switch (variant) {
    case "text-shimmer":
      return <TextShimmerLoader text={text} size={size} className={className} />
    case "circular":
    default:
      return <CircularLoader size={size} className={className} />
  }
}

export { Loader }