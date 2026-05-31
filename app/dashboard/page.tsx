"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DueCard from "@/components/due-card"
import PaymentModal from "@/components/payment-modal"
import ConfirmationModal from "@/components/confirmation-modal"
import ProfileModal from "@/components/profile-modal"
import { useInactivityLogout } from "@/hooks/use-inactivity-logout"
import ThemeToggle from "@/components/theme-toggle"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import { DueManager, type Due } from "@/lib/due-manager"
import { PaymentManager, type Payment } from "@/lib/payment-manager"
import studentsData from "@/data/students.json"
import toast from "react-hot-toast"
import { User, LogOut, AlertCircle, Clock, CheckCircle2, DollarSign, Filter, Menu, X, Home, CreditCard, Settings, Bell } from 'lucide-react'

interface StudentProfile {
  name: string
  matric: string
  email: string
  phone?: string
}

export default function StudentDashboard() {
  const { user, userRole, logout } = useAuth()
  const router = useRouter()
  const [dues, setDues] = useState<Due[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [selectedDue, setSelectedDue] = useState<Due | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useInactivityLogout()

  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 10) {
      document.body.classList.add('scrolled-navbar')
    } else {
      document.body.classList.remove('scrolled-navbar')
    }
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!user || userRole !== "student") {
      router.push("/")
      return
    }

    // Get student info from JSON
    const studentMatric = user?.email?.split("@")[0] || user?.uid || ""
    const studentInfo = studentsData.find((s) => s.matric === studentMatric)

    if (studentInfo) {
      setProfile({
        name: studentInfo.name,
        matric: studentInfo.matric,
        email: studentInfo.email || `${studentInfo.name}${studentInfo.matric}@futo.edu.ng`,
      })
    }

    // Load dues
    const unsubscribeDues = DueManager.getAllDues((duesData) => {
      setDues(duesData)
    })

    // Load student payments with real-time updates
    const unsubscribePayments = PaymentManager.getPaymentsByStudent(studentMatric, (paymentsData) => {
      console.log("Student dashboard - payments updated:", paymentsData.length)
      setPayments(paymentsData)
    })

    return () => {
      unsubscribeDues()
      unsubscribePayments()
    }
  }, [user, userRole, router])

  const getFilteredDues = () => {
    return dues.filter((due) => {
      const levelMatch = selectedLevel === "all" || due.level === selectedLevel
      const semesterMatch = selectedSemester === "all" || due.semester === selectedSemester
      return levelMatch && semesterMatch
    })
  }

  const getDuesByStatus = (status: "unpaid" | "paid" | "verified") => {
    const filtered = getFilteredDues()

    return filtered.filter((due) => {
      const payment = payments.find((p) => p.dueId === due.id)

      switch (status) {
        case "unpaid":
          return !payment // No payment record means unpaid
        case "paid":
          // Status is "paid" and verified is false
          return payment && payment.status === "paid" && !payment.verified
        case "verified":
          // Verified is true (regardless of status, but typically status would be "verified")
          return payment && payment.verified === true
        default:
          return false
      }
    })
  }

  const handlePaymentSubmit = (dueId: string, accountName: string, amount: number) => {
    setConfirmAction(() => async () => {
      try {
        const studentMatric = user?.email?.split("@")[0] || user?.uid || ""
        const studentInfo = studentsData.find((s) => s.matric === studentMatric)
        const due = dues.find((d) => d.id === dueId)

        if (studentInfo && due) {
          await PaymentManager.createPayment(
            studentInfo.matric,
            studentInfo.name,
            dueId,
            due.title,
            accountName,
            amount,
          )
          console.log("Payment submitted - should move from Unpaid to Paid tab")
          toast.success("Payment submitted! Pending verification.")
        }
      } catch (error) {
        console.error("Error submitting payment:", error)
        toast.error("Failed to submit payment")
      }
    })
    setShowConfirmModal(true)
  }

  const handleManualDeliveryConfirm = (dueId: string) => {
    setConfirmAction(() => async () => {
      try {
        const payment = payments.find((p) => p.dueId === dueId)
        if (payment) {
          await PaymentManager.confirmDelivery(payment.id, dueId)
          toast.success("Manual delivery confirmed!")
        }
      } catch (error) {
        console.error("Error confirming delivery:", error)
        toast.error("Failed to confirm delivery")
      }
    })
    setShowConfirmModal(true)
  }

  const handleProfileUpdate = async (phone: string) => {
    // This would update the profile in a separate profiles collection
    toast.success("Phone number updated successfully!")
  }

  const getSummary = () => {
    const filtered = getFilteredDues()
    const unpaid = filtered.filter((due) => !payments.find((p) => p.dueId === due.id)).length
    const paid = filtered.filter((due) => {
      const payment = payments.find((p) => p.dueId === due.id)
      return payment && payment.status === "paid" && !payment.verified
    }).length
    const verified = filtered.filter((due) => {
      const payment = payments.find((p) => p.dueId === due.id)
      return payment && payment.verified
    }).length

    const totalAmount = filtered.reduce((sum, due) => {
      const payment = payments.find((p) => p.dueId === due.id)
      return payment?.verified ? sum : sum + due.amount
    }, 0)

    return { unpaid, paid, verified, totalAmount }
  }

  const summary = getSummary()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-cyan-50/30 to-blue-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 relative overflow-hidden">
      <PWAInstallPrompt />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile Navbar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop Header / Mobile Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-full w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-white/20 dark:border-slate-700/50 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border-b border-white/20 dark:border-slate-700/50 sticky top-0 z-40'
        }
      `}>
        <div className={`${isMobile ? 'p-6 h-full flex flex-col' : 'container mx-auto px-6 py-4'}`}>
          {isMobile && (
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Menu
              </h2>
              <Button
                onClick={() => setIsMobileMenuOpen(false)}
                variant="ghost"
                size="sm"
                className="rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}

          <div className={`flex ${isMobile ? 'flex-col space-y-6' : 'justify-between items-center'}`}>
            <div className={`flex items-center gap-4 ${isMobile ? 'pb-6 border-b border-slate-200 dark:border-slate-700' : ''}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                {/* <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent`}>
                  Student Dashboard
                </h1> */}
                {profile && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {profile.name} • {profile.matric}
                  </p>
                )}
              </div>
            </div>
            
            {isMobile && (
              <div className="flex-1 space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 p-4"
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
               
                <Button
                  onClick={() => setShowProfileModal(true)}
                  variant="ghost"
                  className="w-full justify-start rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 p-4"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Profile Settings
                </Button>

                <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20 dark:border-slate-600/50">
                    <ThemeToggle />
                  </div>
               
              </div>
            )}

            <div className={`flex items-center gap-3 ${isMobile ? 'pt-6 border-t border-slate-200 dark:border-slate-700' : ''}`}>
              {!isMobile && (
                <>
                  <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20 dark:border-slate-600/50">
                    <ThemeToggle />
                  </div>
                  <Button
                    onClick={() => setShowProfileModal(true)}
                    variant="outline"
                    className="rounded-xl border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </>
              )}
              <Button
                onClick={logout}
                variant="outline"
                className={`rounded-xl border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 shadow-lg hover:shadow-xl transition-all duration-200 ${isMobile ? 'w-full justify-start' : ''}`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button - Floating */}
   

      {isMobile && (
  <div className="fixed top-0 left-0 right-0 z-30 transition-all duration-300">
    {/* Scrolled background */}
    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-sm opacity-0 transition-opacity duration-300 [.scrolled-navbar_&]:opacity-100" />
    
    <div className="relative z-10 container mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          variant="outline"
        >
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </Button>
        {!isMobileMenuOpen && (
        <h1 className="text-xl font-bold bg-black dark:bg-gradient-to-r dark:from-white dark:to-white bg-clip-text text-transparent ml-2">
          FST RECORDER
        </h1>
)}

      </div>
      
      {/* Add other navbar items here if needed */}
    </div>
  </div>
)}

<div className={`container mx-auto px-4 sm:px-6 py-8 ${isMobile ? 'pt-24' : ''} relative z-10`}>
  {/* Circular Summary Cards - Mobile Optimized */}
  <div className="mb-6 sm:mb-8">
    {/* Mobile View (2x2 grid) */}
    <div className="flex flex-col gap-4 sm:hidden">
      {/* First Row - Two Cards */}
      <div className="flex gap-4">
        {/* Unpaid Card */}
        <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-red-100/70 to-pink-100/70 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-2xl border border-red-200/50 dark:border-red-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <div className="h-full flex flex-col items-center justify-center relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-red-200 to-pink-200 dark:from-red-800/40 dark:to-pink-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
              {summary.unpaid}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Unpaid</div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-yellow-100/70 to-orange-100/70 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-2xl border border-yellow-200/50 dark:border-yellow-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <div className="h-full flex flex-col items-center justify-center relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-800/40 dark:to-orange-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <Clock className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
              {summary.paid}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Pending</div>
          </div>
        </div>
      </div>

      {/* Second Row - Two Cards */}
      <div className="flex gap-4">
        {/* Verified Card */}
        <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-green-100/70 to-emerald-100/70 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-2xl border border-green-200/50 dark:border-green-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <div className="h-full flex flex-col items-center justify-center relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-800/40 dark:to-emerald-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
              {summary.verified}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Verified</div>
          </div>
        </div>

        {/* Outstanding Card */}
        <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-blue-100/70 to-purple-100/70 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-2xl border border-blue-200/50 dark:border-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <div className="h-full flex flex-col items-center justify-center relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/40 dark:to-purple-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <DollarSign className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
              ₦{summary.totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Outstanding</div>
          </div>
        </div>
      </div>
    </div>

    {/* Desktop View (1x4 grid) */}
    <div className="hidden sm:flex gap-6">
      {/* Unpaid Card */}
      <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-red-100/70 to-pink-100/70 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-2xl border border-red-200/50 dark:border-red-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
        <div className="h-full flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-red-200 to-pink-200 dark:from-red-800/40 dark:to-pink-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
            <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            {summary.unpaid}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Unpaid</div>
        </div>
      </div>

      {/* Pending Card */}
      <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-yellow-100/70 to-orange-100/70 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-2xl border border-yellow-200/50 dark:border-yellow-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
        <div className="h-full flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-800/40 dark:to-orange-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
            <Clock className="w-7 h-7 text-yellow-500 dark:text-yellow-400" />
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            {summary.paid}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Pending</div>
        </div>
      </div>

      {/* Verified Card */}
      <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-green-100/70 to-emerald-100/70 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-2xl border border-green-200/50 dark:border-green-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
        <div className="h-full flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-800/40 dark:to-emerald-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
            <CheckCircle2 className="w-7 h-7 text-green-500 dark:text-green-400" />
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            {summary.verified}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Verified</div>
        </div>
      </div>

      {/* Outstanding Card */}
      <div className="flex-1 aspect-square rounded-full bg-gradient-to-br from-blue-100/70 to-purple-100/70 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-2xl border border-blue-200/50 dark:border-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
        <div className="h-full flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/40 dark:to-purple-800/40 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
            <DollarSign className="w-7 h-7 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            ₦{summary.totalAmount.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Outstanding</div>
        </div>
      </div>
    </div>
  </div>

        {/* Enhanced Filters Section */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Filter Options
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Academic Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl sm:rounded-2xl text-sm sm:text-base text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <option value="all">All Levels</option>
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                  <option value="600L">600L</option>
                </select>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl sm:rounded-2xl text-sm sm:text-base text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <option value="all">All Semesters</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Dues Tabs */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300">
          <Tabs defaultValue="unpaid" className="w-full">
            <div className="bg-gradient-to-r from-slate-50/90 to-slate-100/90 dark:from-slate-700/50 dark:to-slate-600/50 p-2 sm:p-3">
              <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2 sm:gap-3">
                <TabsTrigger 
                  value="unpaid" 
                  className="rounded-xl sm:rounded-2xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md sm:data-[state=active]:shadow-xl transition-all duration-300 font-semibold py-3 sm:py-4 hover:scale-[1.02] text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow"></div>
                    <span>Unpaid</span>
                    <span>({getDuesByStatus("unpaid").length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="paid" 
                  className="rounded-xl sm:rounded-2xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md sm:data-[state=active]:shadow-xl transition-all duration-300 font-semibold py-3 sm:py-4 hover:scale-[1.02] text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow"></div>
                    <span>Paid</span>
                    <span>({getDuesByStatus("paid").length})</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="verified" 
                  className="rounded-xl sm:rounded-2xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md sm:data-[state=active]:shadow-xl transition-all duration-300 font-semibold py-3 sm:py-4 hover:scale-[1.02] text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow"></div>
                    <span>Verified</span>
                    <span>({getDuesByStatus("verified").length})</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6 sm:p-8">
              <TabsContent value="unpaid" className="mt-0">
                <div className="space-y-4 sm:space-y-6">
                  {getDuesByStatus("unpaid").map((due) => {
                    const payment = payments.find((p) => p.dueId === due.id)
                    return (
                      <DueCard
                        key={due.id}
                        due={due}
                        payment={payment}
                        onPayClick={() => {
                          setSelectedDue(due)
                          setShowPaymentModal(true)
                        }}
                        onConfirmDelivery={() => handleManualDeliveryConfirm(due.id)}
                      />
                    )
                  })}
                  {getDuesByStatus("unpaid").length === 0 && (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                        All caught up!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">No unpaid dues found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="paid" className="mt-0">
                <div className="space-y-4 sm:space-y-6">
                  {getDuesByStatus("paid").map((due) => {
                    const payment = payments.find((p) => p.dueId === due.id)
                    return (
                      <DueCard
                        key={due.id}
                        due={due}
                        payment={payment}
                        onConfirmDelivery={() => handleManualDeliveryConfirm(due.id)}
                      />
                    )
                  })}
                  {getDuesByStatus("paid").length === 0 && (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 dark:text-yellow-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                        No pending payments
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">All your payments have been processed</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="verified" className="mt-0">
                <div className="space-y-4 sm:space-y-6">
                  {getDuesByStatus("verified").map((due) => {
                    const payment = payments.find((p) => p.dueId === due.id)
                    return (
                      <DueCard
                        key={due.id}
                        due={due}
                        payment={payment}
                        onConfirmDelivery={() => handleManualDeliveryConfirm(due.id)}
                      />
                    )
                  })}
                  {getDuesByStatus("verified").length === 0 && (
                    <div className="text-center py-12 sm:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                        No verified payments
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Verified payments will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <div className="fixed bottom-6 right-6 z-30">
            <Button
              onClick={() => {
                const unpaidDues = getDuesByStatus("unpaid")
                if (unpaidDues.length > 0) {
                  setSelectedDue(unpaidDues[0])
                  setShowPaymentModal(true)
                }
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-white/20"
            >
              <CreditCard className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Modals */}
      {showPaymentModal && selectedDue && (
        <PaymentModal
          due={selectedDue}
          onSubmit={handlePaymentSubmit}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedDue(null)
          }}
        />
      )}

      {showProfileModal && profile && (
        <ProfileModal 
          profile={profile} 
          onUpdate={handleProfileUpdate} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          onConfirm={() => {
            confirmAction()
            setShowConfirmModal(false)
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  )
}