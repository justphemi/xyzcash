// "use client"

// import { useEffect, useState } from "react"
// import { useAuth } from "@/contexts/auth-context"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import CreateDueForm from "@/components/create-due-form"
// import PaymentVerification from "@/components/payment-verification"
// import { useInactivityLogout } from "@/hooks/use-inactivity-logout"
// import { Eye, Trash2, Clock } from "lucide-react"
// import ThemeToggle from "@/components/theme-toggle"
// import PWAInstallPrompt from "@/components/pwa-install-prompt"
// import { DueManager, type Due } from "@/lib/due-manager"
// import { PaymentManager, type Payment } from "@/lib/payment-manager"
// import toast from "react-hot-toast"

// export default function CourseRepDashboard() {
//   const { userRole, logout } = useAuth()
//   const router = useRouter()
//   const [dues, setDues] = useState<Due[]>([])
//   const [payments, setPayments] = useState<Payment[]>([])
//   const [showCreateForm, setShowCreateForm] = useState(false)

//   useInactivityLogout()

//   useEffect(() => {
//     if (userRole !== "courserep") {
//       router.push("/")
//       return
//     }

//     // Load dues
//     const unsubscribeDues = DueManager.getAllDues((duesData) => {
//       setDues(duesData)
//     })

//     // Load all payments
//     const unsubscribePayments = PaymentManager.getAllPayments((paymentsData) => {
//       setPayments(paymentsData)
//     })

//     return () => {
//       unsubscribeDues()
//       unsubscribePayments()
//     }
//   }, [userRole, router])

//   const handleCreateDue = async (dueData: any) => {
//     try {
//       await DueManager.createDue(dueData)
//       setShowCreateForm(false)
//       toast.success("Due created successfully!")
//     } catch (error) {
//       console.error("Error creating due:", error)
//       toast.error("Failed to create due")
//     }
//   }

//   const handleDeleteDue = async (due: Due) => {
//     if (!DueManager.canDeleteDue(due)) {
//       toast.error("Cannot delete due after 2 hours of creation")
//       return
//     }

//     if (confirm(`Are you sure you want to delete "${due.title}"? This action cannot be undone.`)) {
//       try {
//         await DueManager.deleteDue(due.id)
//         toast.success("Due deleted successfully!")
//       } catch (error: any) {
//         console.error("Error deleting due:", error)
//         toast.error(error.message || "Failed to delete due")
//       }
//     }
//   }

//   const getSummaryStats = () => {
//     const totalDues = dues.length
//     const totalPayments = payments.length
//     const totalPaid = payments.filter((p) => p.status === "paid" && !p.verified).length
//     const totalVerified = payments.filter((p) => p.verified).length

//     return { totalDues, totalPayments, totalPaid, totalVerified }
//   }

//   const stats = getSummaryStats()

//   return (
//     <div className="min-h-screen bg-background">
//       <PWAInstallPrompt />
//       <div className="container mx-auto px-4 py-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-foreground logo">CourseRep Dashboard</h1>
//           <div className="flex gap-2">
//             <ThemeToggle />
//             <Button
//               onClick={logout}
//               variant="outline"
//               className="rounded-none border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
//             >
//               Logout
//             </Button>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-card-foreground">{stats.totalDues}</div>
//               <div className="text-sm text-muted-foreground">Total Dues</div>
//             </CardContent>
//           </Card>
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-card-foreground">{stats.totalPayments}</div>
//               <div className="text-sm text-muted-foreground">Total Payments</div>
//             </CardContent>
//           </Card>
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalPaid}</div>
//               <div className="text-sm text-muted-foreground">Pending Verification</div>
//             </CardContent>
//           </Card>
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalVerified}</div>
//               <div className="text-sm text-muted-foreground">Verified</div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap gap-4 mb-6">
//           <Button
//             onClick={() => setShowCreateForm(true)}
//             className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
//           >
//             Create New Due
//           </Button>
//         </div>

//         {/* Main Content Tabs */}
//         <Tabs defaultValue="verification" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 rounded-none border border-border bg-muted">
//             <TabsTrigger value="verification" className="rounded-none data-[state=active]:bg-background">
//               Payment Verification
//             </TabsTrigger>
//             <TabsTrigger value="dues" className="rounded-none data-[state=active]:bg-background">
//               Manage Dues
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="verification" className="mt-4">
//             <PaymentVerification />
//           </TabsContent>

//           <TabsContent value="dues" className="mt-4">
//             <div className="grid gap-4">
//               {dues.map((due) => {
//                 const canDelete = DueManager.canDeleteDue(due)
//                 const timeInfo = DueManager.getTimeUntilDeletionExpiry(due)

//                 return (
//                   <Card key={due.id} className="rounded-none border-border bg-card">
//                     <CardHeader>
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <CardTitle className="text-card-foreground">{due.title}</CardTitle>
//                           <div className="flex items-center gap-2 mt-1">
//                             <Clock className="h-4 w-4 text-muted-foreground" />
//                             <span className="text-xs text-muted-foreground">{timeInfo}</span>
//                           </div>
//                         </div>
//                         <div className="flex gap-2">
//                           <Button
//                             onClick={() => router.push(`/courserep/dues/${due.id}`)}
//                             size="sm"
//                             className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
//                           >
//                             <Eye className="h-4 w-4 mr-2" />
//                             View Details
//                           </Button>
//                           {canDelete && (
//                             <Button
//                               onClick={() => handleDeleteDue(due)}
//                               size="sm"
//                               variant="destructive"
//                               className="rounded-none"
//                             >
//                               <Trash2 className="h-4 w-4 mr-2" />
//                               Delete
//                             </Button>
//                           )}
//                         </div>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                         <div>
//                           <span className="font-semibold text-card-foreground">Amount:</span>
//                           <span className="ml-2 text-muted-foreground">₦{due.amount?.toLocaleString()}</span>
//                         </div>
//                         <div>
//                           <span className="font-semibold text-card-foreground">Level:</span>
//                           <span className="ml-2 text-muted-foreground">{due.level}</span>
//                         </div>
//                         <div>
//                           <span className="font-semibold text-card-foreground">Semester:</span>
//                           <span className="ml-2 text-muted-foreground">{due.semester}</span>
//                         </div>
//                         <div>
//                           <span className="font-semibold text-card-foreground">Deadline:</span>
//                           <span className="ml-2 text-muted-foreground">
//                             {new Date(due.deadline).toLocaleDateString()}
//                           </span>
//                         </div>
//                       </div>
//                       <p className="mt-2 text-muted-foreground">{due.description}</p>
//                       <div className="mt-2 text-xs text-muted-foreground">
//                         Created: {new Date(due.createdAt).toLocaleString()}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )
//               })}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Create Due Modal */}
//       {showCreateForm && <CreateDueForm onSubmit={handleCreateDue} onClose={() => setShowCreateForm(false)} />}
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateDueForm from "@/components/create-due-form"
import PaymentVerification from "@/components/payment-verification"
import { useInactivityLogout } from "@/hooks/use-inactivity-logout"
import { Eye, Trash2, Plus } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import { DueManager, type Due } from "@/lib/due-manager"
import { PaymentManager, type Payment } from "@/lib/payment-manager"
import toast from "react-hot-toast"
import { User, LogOut, AlertCircle, Clock, CheckCircle2, DollarSign, Filter, Menu, X, Home, CreditCard, Settings, Bell } from 'lucide-react'
export default function CourseRepDashboard() {
  const { userRole, logout } = useAuth()
  const router = useRouter()
  const [dues, setDues] = useState<Due[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  useInactivityLogout()

  useEffect(() => {
    if (userRole !== "courserep") {
      router.push("/")
      return
    }

    // Load dues
    const unsubscribeDues = DueManager.getAllDues((duesData) => {
      setDues(duesData)
    })

    // Load all payments
    const unsubscribePayments = PaymentManager.getAllPayments((paymentsData) => {
      setPayments(paymentsData)
    })

    return () => {
      unsubscribeDues()
      unsubscribePayments()
    }
  }, [userRole, router])

  const handleCreateDue = async (dueData: any) => {
    try {
      await DueManager.createDue(dueData)
      setShowCreateForm(false)
      toast.success("Due created successfully!")
    } catch (error) {
      console.error("Error creating due:", error)
      toast.error("Failed to create due")
    }
  }

  const handleDeleteDue = async (due: Due) => {
    if (!DueManager.canDeleteDue(due)) {
      toast.error("Cannot delete due after 2 hours of creation")
      return
    }

    if (confirm(`Are you sure you want to delete "${due.title}"? This action cannot be undone.`)) {
      try {
        await DueManager.deleteDue(due.id)
        toast.success("Due deleted successfully!")
      } catch (error: any) {
        console.error("Error deleting due:", error)
        toast.error(error.message || "Failed to delete due")
      }
    }
  }

  const getSummaryStats = () => {
    const totalDues = dues.length
    const totalPayments = payments.length
    const totalPaid = payments.filter((p) => p.status === "paid" && !p.verified).length
    const totalVerified = payments.filter((p) => p.verified).length

    return { totalDues, totalPayments, totalPaid, totalVerified }
  }

  const stats = getSummaryStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <PWAInstallPrompt />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              CourseRep Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage dues and verify payments for your course
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <Button
              onClick={logout}
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow hover:shadow-md transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Summary Cards - Modern Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.totalDues}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total Dues</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <Clock className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.totalPayments}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total Payments</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <DollarSign className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.totalPaid}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Pending Verification</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <Clock className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.totalVerified}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Verified Payments</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Due
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="bg-transparent gap-2 p-0">
            <TabsTrigger 
              value="verification" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-semibold transition-all"
            >
              Payment Verification
            </TabsTrigger>
            <TabsTrigger 
              value="dues" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg rounded-xl px-6 py-3 font-semibold transition-all"
            >
              Manage Dues
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="verification">
              <PaymentVerification />
            </TabsContent>

            <TabsContent value="dues">
              <div className="grid gap-6">
                {dues.map((due) => {
                  const canDelete = DueManager.canDeleteDue(due)
                  const timeInfo = DueManager.getTimeUntilDeletionExpiry(due)

                  return (
                    <Card key={due.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                              {due.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              <span className="text-sm text-slate-500 dark:text-slate-400">{timeInfo}</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => router.push(`/courserep/dues/${due.id}`)}
                              size="sm"
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md transition-all"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {canDelete && (
                              <Button
                                onClick={() => handleDeleteDue(due)}
                                size="sm"
                                variant="destructive"
                                className="rounded-lg shadow hover:shadow-md transition-all"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Amount</div>
                            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                              ₦{due.amount?.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Level</div>
                            <div className="text-lg font-medium text-slate-800 dark:text-slate-200">{due.level}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Semester</div>
                            <div className="text-lg font-medium text-slate-800 dark:text-slate-200">{due.semester}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Deadline</div>
                            <div className="text-lg font-medium text-slate-800 dark:text-slate-200">
                              {new Date(due.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {due.description && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-4">
                            <div className="font-semibold text-slate-500 dark:text-slate-400 mb-2">Description</div>
                            <p className="text-slate-700 dark:text-slate-300">{due.description}</p>
                          </div>
                        )}
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Created: {new Date(due.createdAt).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Create Due Modal */}
      {showCreateForm && <CreateDueForm onSubmit={handleCreateDue} onClose={() => setShowCreateForm(false)} />}
    </div>
  )
}