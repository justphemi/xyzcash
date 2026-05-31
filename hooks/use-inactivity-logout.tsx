"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

export function useInactivityLogout(timeoutMinutes = 10) {
  const { logout } = useAuth()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(
      () => {
        logout()
        alert("You have been logged out due to inactivity.")
      },
      timeoutMinutes * 60 * 1000,
    )
  }

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    const resetTimeoutHandler = () => resetTimeout()

    // Set initial timeout
    resetTimeout()

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimeoutHandler, true)
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      events.forEach((event) => {
        document.removeEventListener(event, resetTimeoutHandler, true)
      })
    }
  }, [logout, timeoutMinutes])
}
