"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { toast } from "sonner"

interface AppStatusIndicatorProps {
  onRefresh?: () => void
}

export function AppStatusIndicator({ onRefresh }: AppStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced")

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success("Connection restored")
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error("Connection lost")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRefresh = async () => {
    setSyncStatus("syncing")
    try {
      if (onRefresh) {
        await onRefresh()
      }
      setLastSync(new Date())
      setSyncStatus("synced")
      toast.success("Data refreshed successfully")
    } catch (error) {
      setSyncStatus("error")
      toast.error("Failed to refresh data")
    }
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3 text-red-500" />
    if (syncStatus === "syncing") return <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
    if (syncStatus === "error") return <AlertTriangle className="h-3 w-3 text-orange-500" />
    return <CheckCircle className="h-3 w-3 text-green-500" />
  }

  const getStatusText = () => {
    if (!isOnline) return "Offline"
    if (syncStatus === "syncing") return "Syncing..."
    if (syncStatus === "error") return "Sync Error"
    return "Online"
  }

  const getStatusVariant = () => {
    if (!isOnline) return "destructive" as const
    if (syncStatus === "error") return "secondary" as const
    return "default" as const
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Badge variant={getStatusVariant()} className="flex items-center gap-1 text-xs">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">App Status</h4>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={syncStatus === "syncing"}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection:</span>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lastSync.toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Status:</span>
                <Badge variant={getStatusVariant()} className="text-xs">
                  {getStatusText()}
                </Badge>
              </div>
            </div>

            {!isOnline && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  You're currently offline. Some features may not work properly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
