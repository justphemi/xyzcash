"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show prompt after 30 seconds on first visit
      const hasSeenPrompt = localStorage.getItem("pwa-install-prompt-seen")
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true)
        }, 30000)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setShowPrompt(false)
    localStorage.setItem("pwa-install-prompt-seen", "true")

    if (outcome === "accepted") {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-prompt-seen", "true")
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="rounded-none border-black bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm font-semibold text-black">Install FST RECORDER</div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0 rounded-none">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            Get the full app experience with offline access and notifications.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex-1 bg-black text-white hover:bg-gray-800 rounded-none text-xs"
            >
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="flex-1 rounded-none border-black text-black hover:bg-black hover:text-white text-xs bg-transparent"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
