"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import LoginForm from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"
import FirebaseSetupGuide from "@/components/firebase-setup-guide"
import PWAInstallPrompt from "@/components/pwa-install-prompt"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const { user, userRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false)
      if (user && userRole === "student") {
        router.push("/dashboard")
      } else if (userRole === "courserep") {
        router.push("/courserep")
      }
    })

    return () => unsubscribe()
  }, [router, userRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <FirebaseSetupGuide />
      <PWAInstallPrompt />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 logo">FST RECORDER</h1>
            <p className="text-muted-foreground">Money Management System</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
