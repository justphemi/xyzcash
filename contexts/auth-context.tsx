"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  userRole: "student" | "courserep" | null
  setUserRole: (role: "student" | "courserep" | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  setUserRole: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<"student" | "courserep" | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!user) {
        setUserRole(null)
        // Clear courserep session
        localStorage.removeItem("courserep_session")
      }
    })

    // Check for courserep session
    const courserepSession = localStorage.getItem("courserep_session")
    if (courserepSession) {
      setUserRole("courserep")
    }

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      if (userRole === "courserep") {
        localStorage.removeItem("courserep_session")
        setUserRole(null)
        router.push("/")
      } else {
        await signOut(auth)
        setUserRole(null)
        router.push("/")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, userRole, setUserRole, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
