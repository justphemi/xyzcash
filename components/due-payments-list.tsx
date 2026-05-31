"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentManager, type Payment } from "@/lib/payment-manager"
import studentsData from "@/data/students.json"
import toast from "react-hot-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"

interface DuePaymentsListProps {
  dueId: string
  due: any
}

export default function DuePaymentsList({ dueId, due }: DuePaymentsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState<Payment[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    action: () => void
    variant?: "default" | "destructive"
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  })

  useEffect(() => {
    const unsubscribe = PaymentManager.getPaymentsByDue(dueId, (paymentsData) => {
      setPayments(paymentsData)
    })

    return unsubscribe
  }, [dueId])

  const handleVerifyPayment = async (paymentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Verify Payment",
      message: "Are you sure you want to verify this payment?",
      action: async () => {
        try {
          await PaymentManager.verifyPayment(paymentId, dueId)
          toast.success("Payment verified successfully!")
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error("Error verifying payment:", error)
          toast.error("Failed to verify payment")
        }
      },
    })
  }

  const handleUnverifyPayment = async (paymentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Unverify Payment",
      message: "Are you sure you want to unverify this payment?",
      action: async () => {
        try {
          await PaymentManager.unverifyPayment(paymentId, dueId)
          toast.success("Payment unverified successfully!")
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error("Error unverifying payment:", error)
          toast.error("Failed to unverify payment")
        }
      },
      variant: "destructive",
    })
  }

  const handleConfirmDelivery = async (paymentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Delivery",
      message: "Are you sure you want to confirm manual delivery?",
      action: async () => {
        try {
          await PaymentManager.confirmDelivery(paymentId, dueId)
          toast.success("Manual delivery confirmed!")
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error("Error confirming delivery:", error)
          toast.error("Failed to confirm delivery")
        }
      },
    })
  }

  const getStudentPayments = (status: "all" | "unpaid" | "paid" | "verified") => {
    return studentsData
      .map((student) => {
        const payment = payments.find((p) => p.studentMatric === student.matric)

        let paymentStatus = "unpaid"
        if (payment) {
          if (payment.verified) {
            paymentStatus = "verified"
          } else if (payment.status === "paid") {
            paymentStatus = "paid"
          }
        }

        return {
          ...student,
          payment,
          paymentStatus,
        }
      })
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.matric.includes(searchTerm)

        const matchesStatus = status === "all" || student.paymentStatus === status

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        // Sort by payment date if both have payments, otherwise by name
        if (a.payment?.paidAt && b.payment?.paidAt) {
          return new Date(b.payment.paidAt).getTime() - new Date(a.payment.paidAt).getTime()
        }
        return a.name.localeCompare(b.name)
      })
  }

  const allStudents = getStudentPayments("all")
  const unpaidStudents = getStudentPayments("unpaid")
  const paidStudents = getStudentPayments("paid")
  const verifiedStudents = getStudentPayments("verified")

  return (
    <Card className="rounded-none border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Student Payments</CardTitle>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name or matric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-none bg-background text-foreground"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border border-border bg-muted">
            <TabsTrigger value="all" className="rounded-none data-[state=active]:bg-background">
              All ({allStudents.length})
            </TabsTrigger>
            <TabsTrigger value="unpaid" className="rounded-none data-[state=active]:bg-background">
              Unpaid ({unpaidStudents.length})
            </TabsTrigger>
            <TabsTrigger value="paid" className="rounded-none data-[state=active]:bg-background">
              Paid ({paidStudents.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="rounded-none data-[state=active]:bg-background">
              Verified ({verifiedStudents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <StudentPaymentTable
              students={allStudents}
              onVerify={handleVerifyPayment}
              onUnverify={handleUnverifyPayment}
              onConfirmDelivery={handleConfirmDelivery}
            />
          </TabsContent>

          <TabsContent value="unpaid" className="mt-4">
            <StudentPaymentTable
              students={unpaidStudents}
              onVerify={handleVerifyPayment}
              onUnverify={handleUnverifyPayment}
              onConfirmDelivery={handleConfirmDelivery}
            />
          </TabsContent>

          <TabsContent value="paid" className="mt-4">
            <StudentPaymentTable
              students={paidStudents}
              onVerify={handleVerifyPayment}
              onUnverify={handleUnverifyPayment}
              onConfirmDelivery={handleConfirmDelivery}
            />
          </TabsContent>

          <TabsContent value="verified" className="mt-4">
            <StudentPaymentTable
              students={verifiedStudents}
              onVerify={handleVerifyPayment}
              onUnverify={handleUnverifyPayment}
              onConfirmDelivery={handleConfirmDelivery}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        variant={confirmDialog.variant}
      />
    </Card>
  )
}

function StudentPaymentTable({
  students,
  onVerify,
  onUnverify,
  onConfirmDelivery,
}: {
  students: any[]
  onVerify: (paymentId: string) => void
  onUnverify: (paymentId: string) => void
  onConfirmDelivery: (paymentId: string) => void
}) {
  return (
    <div className="space-y-2">
      {students.map((student) => (
        <div key={student.matric} className="border border-border p-4 bg-card rounded-none">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-semibold text-card-foreground">{student.name}</div>
              <div className="text-sm text-muted-foreground">Matric: {student.matric}</div>

              {student.payment && (
                <div className="mt-2 text-sm space-y-1">
                  <div>
                    <span className="font-semibold text-card-foreground">Account:</span>
                    <span className="ml-2 text-muted-foreground">{student.payment.accountName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-card-foreground">Amount:</span>
                    <span className="ml-2 text-muted-foreground">₦{student.payment.amount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-card-foreground">Paid:</span>
                    <span className="ml-2 text-muted-foreground">
                      {new Date(student.payment.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                  {student.payment.verifiedAt && (
                    <div>
                      <span className="font-semibold text-card-foreground">Verified:</span>
                      <span className="ml-2 text-muted-foreground">
                        {new Date(student.payment.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  student.paymentStatus === "verified"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : student.paymentStatus === "paid"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {student.paymentStatus.toUpperCase()}
              </div>

              {student.paymentStatus === "paid" && student.payment && (
                <Button
                  onClick={() => onVerify(student.payment.id)}
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700 rounded-none"
                >
                  Verify
                </Button>
              )}

              {student.paymentStatus === "verified" && student.payment && (
                <Button
                  onClick={() => onUnverify(student.payment.id)}
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-700 rounded-none"
                >
                  Unverify
                </Button>
              )}

              {student.paymentStatus === "verified" && student.payment && !student.payment.manualDelivered && (
                <Button
                  onClick={() => onConfirmDelivery(student.payment.id)}
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-none"
                >
                  Confirm Delivery
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {students.length === 0 && <div className="text-center py-8 text-muted-foreground">No students found</div>}
    </div>
  )
}
