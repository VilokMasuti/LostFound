"use client"

import { CheckCircle, Circle, Search, Sparkles, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ModernStatusTimelineProps {
  currentStatus: "submitted" | "searching" | "matched" | "resolved"
  type: "lost" | "found"
  className?: string
}

export function ModernStatusTimeline({ currentStatus, type, className = "" }: ModernStatusTimelineProps) {
  const steps = [
    {
      id: "submitted",
      title: "Report Submitted",
      description: `Your ${type} item report is now live`,
      icon: Circle,
      status: "completed" as const,
    },
    {
      id: "searching",
      title: "Searching for Matches",
      description: "Our system is looking for potential matches",
      icon: Search,
      status:
        currentStatus === "searching"
          ? ("current" as const)
          : ["matched", "resolved"].includes(currentStatus)
            ? ("completed" as const)
            : ("pending" as const),
    },
    {
      id: "matched",
      title: "Match Found",
      description: "We found a potential match for your item",
      icon: Sparkles,
      status:
        currentStatus === "matched"
          ? ("current" as const)
          : currentStatus === "resolved"
            ? ("completed" as const)
            : ("pending" as const),
    },
    {
      id: "resolved",
      title: "Case Resolved",
      description: "Your item has been successfully returned!",
      icon: CheckCircle,
      status: currentStatus === "resolved" ? ("completed" as const) : ("pending" as const),
    },
  ]

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4 relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 h-12 ${
                    step.status === "completed" ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}

              {/* Step Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === "completed"
                    ? "bg-green-500 text-white"
                    : step.status === "current"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="w-4 h-4" />
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-medium ${
                      step.status === "completed"
                        ? "text-green-600 dark:text-green-400"
                        : step.status === "current"
                          ? "text-primary"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.status === "current" && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
