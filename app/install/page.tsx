"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-none border-black">
        <CardHeader>
          <CardTitle className="text-black text-center">Install FST RECORDER</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">📱</div>
          <p className="text-gray-600">
            Install FST RECORDER as a Progressive Web App for the best experience with offline support and notifications.
          </p>

          {isInstallable ? (
            <Button onClick={handleInstall} className="w-full bg-black text-white hover:bg-gray-800 rounded-none">
              Install App
            </Button>
          ) : (
            <div className="text-sm text-gray-500">App installation is not available on this device or browser.</div>
          )}

          <div className="text-xs text-gray-400 mt-4">
            <p>Features include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Offline access to dues and payment history</li>
              <li>Push notifications for new dues</li>
              <li>Fast loading and native app experience</li>
              <li>Secure authentication and data protection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
