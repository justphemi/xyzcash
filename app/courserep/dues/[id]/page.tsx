// "use client"

// import { useEffect, useState } from "react"
// import { useAuth } from "@/contexts/auth-context"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import DuePaymentsList from "@/components/due-payments-list"
// import DueExportPDF from "@/components/due-export-pdf"
// import { useInactivityLogout } from "@/hooks/use-inactivity-logout"
// import { ArrowLeft, Download } from "lucide-react"
// import ThemeToggle from "@/components/theme-toggle"
// import { DueManager, type Due } from "@/lib/due-manager"
// import { PaymentManager, type Payment } from "@/lib/payment-manager"

// export default function DueDetailsPage({ params }: { params: { id: string } }) {
//   const { userRole } = useAuth()
//   const router = useRouter()
//   const [due, setDue] = useState<Due | null>(null)
//   const [payments, setPayments] = useState<Payment[]>([])
//   const [showExportModal, setShowExportModal] = useState(false)

//   useInactivityLogout()

//   useEffect(() => {
//     if (userRole !== "courserep") {
//       router.push("/")
//       return
//     }

//     // Load the specific due
//     const loadDue = async () => {
//       try {
//         const dueData = await DueManager.getDueById(params.id)
//         setDue(dueData)
//       } catch (error) {
//         console.error("Error loading due:", error)
//         router.push("/courserep")
//       }
//     }

//     loadDue()

//     // Load payments for this due
//     const unsubscribePayments = PaymentManager.getPaymentsByDue(params.id, (paymentsData) => {
//       setPayments(paymentsData)
//     })

//     return () => {
//       unsubscribePayments()
//     }
//   }, [userRole, router, params.id])

//   if (!due) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-muted-foreground">Loading...</div>
//       </div>
//     )
//   }

//   const getPaymentStats = () => {
//     const totalPayments = payments.length
//     const paidPayments = payments.filter((p) => p.status === "paid" && !p.verified).length
//     const verifiedPayments = payments.filter((p) => p.verified).length
//     const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)

//     return { totalPayments, paidPayments, verifiedPayments, totalAmount }
//   }

//   const stats = getPaymentStats()

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-6">
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <Button
//               onClick={() => router.push("/courserep")}
//               variant="outline"
//               className="rounded-none border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Dashboard
//             </Button>
//             <div>
//               <h1 className="text-2xl font-bold text-foreground">{due.title}</h1>
//               <p className="text-muted-foreground text-sm">Due Details & Payment Management</p>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               onClick={() => setShowExportModal(true)}
//               variant="outline"
//               className="rounded-none border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Export PDF
//             </Button>
//             <ThemeToggle />
//           </div>
//         </div>

//         {/* Due Information Card */}
//         <Card className="rounded-none border-border bg-card mb-6">
//           <CardHeader>
//             <CardTitle className="text-card-foreground">Due Information</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//               <div>
//                 <span className="font-semibold text-card-foreground">Amount:</span>
//                 <span className="ml-2 text-muted-foreground">₦{due.amount.toLocaleString()}</span>
//               </div>
//               <div>
//                 <span className="font-semibold text-card-foreground">Level:</span>
//                 <span className="ml-2 text-muted-foreground">{due.level}</span>
//               </div>
//               <div>
//                 <span className="font-semibold text-card-foreground">Semester:</span>
//                 <span className="ml-2 text-muted-foreground">{due.semester}</span>
//               </div>
//               <div>
//                 <span className="font-semibold text-card-foreground">Category:</span>
//                 <span className="ml-2 text-muted-foreground">{due.category}</span>
//               </div>
//             </div>
//             <div className="mb-4">
//               <span className="font-semibold text-card-foreground">Description:</span>
//               <p className="mt-1 text-muted-foreground">{due.description}</p>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//               <div>
//                 <span className="font-semibold text-card-foreground">Deadline:</span>
//                 <span className="ml-2 text-muted-foreground">{new Date(due.deadline).toLocaleDateString()}</span>
//               </div>
//               <div>
//                 <span className="font-semibold text-card-foreground">Created:</span>
//                 <span className="ml-2 text-muted-foreground">{new Date(due.createdAt).toLocaleDateString()}</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Payment Statistics */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-card-foreground">{stats.totalPayments}</div>
//               <div className="text-sm text-muted-foreground">Total Payments</div>
//             </CardContent>
//           </Card>
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.paidPayments}</div>
//               <div className="text-sm text-muted-foreground">Pending Verification</div>
//             </CardContent>
//           </Card>
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.verifiedPayments}</div>
//               <div className="text-sm text-muted-foreground">Verified</div>
//             </CardContent>
//           </Card>
//           <Card className="rounded-none border-border bg-card">
//             <CardContent className="p-4">
//               <div className="text-2xl font-bold text-card-foreground">₦{stats.totalAmount.toLocaleString()}</div>
//               <div className="text-sm text-muted-foreground">Total Collected</div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Student Payments List */}
//         <DuePaymentsList dueId={params.id} due={due} />
//       </div>

//       {/* Export PDF Modal */}
//       {showExportModal && <DueExportPDF due={due} payments={payments} onClose={() => setShowExportModal(false)} />}
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DuePaymentsList from "@/components/due-payments-list"
import DueExportPDF from "@/components/due-export-pdf"
import { useInactivityLogout } from "@/hooks/use-inactivity-logout"
import { ArrowLeft, Download, Clock, CheckCircle2, AlertCircle, DollarSign } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import { DueManager, type Due } from "@/lib/due-manager"
import { PaymentManager, type Payment } from "@/lib/payment-manager"

export default function DueDetailsPage({ params }: { params: { id: string } }) {
  const { userRole } = useAuth()
  const router = useRouter()
  const [due, setDue] = useState<Due | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [showExportModal, setShowExportModal] = useState(false)

  useInactivityLogout()

  useEffect(() => {
    if (userRole !== "courserep") {
      router.push("/")
      return
    }

    // Load the specific due
    const loadDue = async () => {
      try {
        const dueData = await DueManager.getDueById(params.id)
        setDue(dueData)
      } catch (error) {
        console.error("Error loading due:", error)
        router.push("/courserep")
      }
    }

    loadDue()

    // Load payments for this due
    const unsubscribePayments = PaymentManager.getPaymentsByDue(params.id, (paymentsData) => {
      setPayments(paymentsData)
    })

    return () => {
      unsubscribePayments()
    }
  }, [userRole, router, params.id])

  if (!due) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const getPaymentStats = () => {
    const totalPayments = payments.length
    const paidPayments = payments.filter((p) => p.status === "paid" && !p.verified).length
    const verifiedPayments = payments.filter((p) => p.verified).length
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)

    return { totalPayments, paidPayments, verifiedPayments, totalAmount }
  }

  const stats = getPaymentStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/courserep")}
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow hover:shadow-md transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {due.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Due Details & Payment Management</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowExportModal(true)}
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow hover:shadow-md transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Due Information Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Due Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Amount</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  ₦{due.amount.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Level</div>
                <div className="text-xl font-medium text-slate-800 dark:text-slate-200">{due.level}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Semester</div>
                <div className="text-xl font-medium text-slate-800 dark:text-slate-200">{due.semester}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</div>
                <div className="text-xl font-medium text-slate-800 dark:text-slate-200">{due.category}</div>
              </div>
            </div>
            
            {due.description && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-6">
                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-2">Description</div>
                <p className="text-slate-700 dark:text-slate-300">{due.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Deadline</div>
                <div className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  {new Date(due.deadline).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Created</div>
                <div className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  {new Date(due.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.totalPayments}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total Payments</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <DollarSign className="w-6 h-6 text-blue-500 dark:text-blue-400" />
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
                    {stats.paidPayments}
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
                    {stats.verifiedPayments}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Verified</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
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
                    ₦{stats.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total Collected</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <DollarSign className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Payments List */}
        <DuePaymentsList dueId={params.id} due={due} />
      </div>

      {/* Export PDF Modal */}
      {showExportModal && <DueExportPDF due={due} payments={payments} onClose={() => setShowExportModal(false)} />}
    </div>
  )
}