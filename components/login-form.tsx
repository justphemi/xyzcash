
"use client"

import type React from "react"

import { useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { ref, set } from "firebase/database"
import { auth, database } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import studentsData from "@/data/students.json"
import ThemeToggle from "@/components/theme-toggle"
import { Eye, EyeOff, User, Lock, AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { setUserRole } = useAuth()
  const router = useRouter()

  const extractSurname = (fullName: string): string => {
    // Get the last word from the full name as surname
    const nameParts = fullName.trim().split(" ")
    return nameParts[nameParts.length - 1].toUpperCase()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check if it's CourseRep login
      if (identifier === "@ep.saviour" && password === "#FST01") {
        // Handle CourseRep login with session
        const response = await fetch("/api/auth/courserep", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: identifier, password }),
        })

        if (response.ok) {
          setUserRole("courserep")
          localStorage.setItem("courserep_session", "active")
          router.push("/courserep")
          return
        }
      }

      // Student login logic
      const student = studentsData.find((s) => s.matric === identifier || s.email === identifier)

      if (!student) {
        setError("Student not found. Please check your matric number.")
        return
      }

      // Generate email and expected password
      const email = student.email || `${student.matric}@FSTRECORDER.site`
      const expectedPassword = extractSurname(student.name) 
      console.log(expectedPassword)
      if (password !== expectedPassword) {
        setError(`Incorrect password. Use your middle name in CAPS,make sure it is based on the classlist: `)
        return
      }

      try {
        // Try to sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, expectedPassword + "12345678910_")

        // Update student record in database
        const studentRef = ref(database, `students/${student.matric}`)
        await set(studentRef, {
          email: email,
          name: student.name,
          matric: student.matric,
          lastLogin: new Date().toISOString(),
        })

        setUserRole("student")
        router.push("/dashboard")
      } catch (authError: any) {
        console.error("Auth error:", authError)

        if (authError.code === "auth/user-not-found" || authError.code === "auth/invalid-credential") {
          // Create user account for first time
          try {
            await createUserWithEmailAndPassword(auth, email, expectedPassword + "12345678910_")

            // Save student data to database
            const studentRef = ref(database, `students/${student.matric}`)
            await set(studentRef, {
              email: email,
              name: student.name,
              matric: student.matric,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            })

            setUserRole("student")
            router.push("/dashboard")
          } catch (createError: any) {
            console.error("Create user error:", createError)
            setError(`Account creation failed: ${createError.message}`)
          }
        } else if (authError.code === "auth/configuration-not-found") {
          setError("Firebase Authentication is not configured. Please contact administrator.")
        } else {
          setError(`Login failed: ${authError.message}`)
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md">
        {/* Theme Toggle - Floating */}
        <div className="flex justify-end mb-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20 dark:border-slate-700/50">
            <ThemeToggle />
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10 px-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 text-base">
              Sign in to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Identifier Input */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-slate-700 dark:text-slate-300 font-medium">
                  Matric Number / Email / Username
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-12 pr-4 py-6 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="20231376642 or @ep.saviour"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 py-6 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="Enter your surname in CAPS"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Login Examples */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl border border-blue-100 dark:border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="font-semibold text-slate-800 dark:text-slate-200">Login Examples</div>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span><span className="font-medium">Student:</span> 20230459003 + CHIKASOM (middle name based on classlist)</span>
                </div>
                <div className="flex items-center gap-2">
                 
                
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}