"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

interface EnhancedEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EnhancedEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EnhancedEmptyStateProps) {
  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardContent className="empty-state">
        <Icon className="empty-state-icon text-muted-foreground" />
        <h3 className="text-xl font-bold mb-4 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto responsive-text">{description}</p>
        {actionLabel && (actionHref || onAction) && (
          <div className="button-group justify-center">
            {actionHref ? (
              <Button asChild>
                <a href={actionHref}>{actionLabel}</a>
              </Button>
            ) : (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
