"use client"

import * as React from "react"
import * as LucideIcons from "lucide-react"

import { cn } from "@/lib/utils"

export function IconPlaceholder({
  lucide,
  className,
  ...props
}: {
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
  className?: string
} & React.SVGProps<SVGSVGElement>) {
  if (lucide && lucide in LucideIcons) {
    const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[lucide]
    if (Icon) {
      return <Icon className={cn("size-4", className)} />
    }
  }

  return <span className={cn("size-4 inline-block", className)} />
}
