"use client"

import { Sparkles, Eye, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ModernMatchBannerProps {
  matchCount: number
  onReview: () => void
  onDismiss?: () => void
}

export function ModernMatchBanner({ matchCount, onReview, onDismiss }: ModernMatchBannerProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
              <Sparkles className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 text-lg">
                🎯 Great news! We found a match!
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                We discovered {matchCount} potential match{matchCount > 1 ? "es" : ""} for your item. Review{" "}
                {matchCount > 1 ? "them" : "it"} now to confirm.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={onReview} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Eye className="mr-2 h-4 w-4" />
              Review Match{matchCount > 1 ? "es" : ""}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
