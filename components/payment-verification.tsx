"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentManager, type Payment } from "@/lib/payment-manager"
import toast from "react-hot-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"

export default function PaymentVerification() {
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
    const unsubscribe = PaymentManager.getAllPayments((paymentsData) => {
      console.log("PaymentVerification - all payments updated:", paymentsData.length)
      setPayments(paymentsData)
    })

    return unsubscribe
  }, [])

  const handleVerifyPayment = async (paymentId: string, dueId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Verify Payment",
      message: "Are you sure you want to verify this payment? This action will mark the payment as verified.",
      action: async () => {
        try {
          console.log("Verifying payment:", paymentId, "for due:", dueId)
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

  const handleUnverifyPayment = async (paymentId: string, dueId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Unverify Payment",
      message: "Are you sure you want to unverify this payment? This will move it back to pending status.",
      action: async () => {
        try {
          console.log("Unverifying payment:", paymentId, "for due:", dueId)
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

  const handleConfirmDelivery = async (paymentId: string, dueId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Delivery",
      message: "Are you sure you want to confirm manual delivery? This action cannot be undone.",
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

  const getFilteredPayments = () => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.studentMatric.includes(searchTerm) ||
        payment.dueTitle.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }

  const filteredPayments = getFilteredPayments()

  // Pending: status === "paid" AND verified === false
  const pendingPayments = filteredPayments.filter((p) => p.status === "paid" && p.verified === false)

  // Verified: verified === true (regardless of status)
  const verifiedPayments = filteredPayments.filter((p) => p.verified === true)

  console.log("PaymentVerification render:", {
    total: filteredPayments.length,
    pending: pendingPayments.length,
    verified: verifiedPayments.length,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, matric, or due title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded-none bg-background text-foreground"
        />
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none border border-border bg-muted">
          <TabsTrigger value="pending" className="rounded-none data-[state=active]:bg-background">
            Pending Verification ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="rounded-none data-[state=active]:bg-background">
            Verified ({verifiedPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <PaymentsList
            payments={pendingPayments}
            onVerify={handleVerifyPayment}
            onUnverify={handleUnverifyPayment}
            onConfirmDelivery={handleConfirmDelivery}
            type="pending"
          />
        </TabsContent>

        <TabsContent value="verified" className="mt-4">
          <PaymentsList
            payments={verifiedPayments}
            onVerify={handleVerifyPayment}
            onUnverify={handleUnverifyPayment}
            onConfirmDelivery={handleConfirmDelivery}
            type="verified"
          />
        </TabsContent>
      </Tabs>
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        variant={confirmDialog.variant}
      />
    </div>
  )
}

function PaymentsList({
  payments,
  onVerify,
  onUnverify,
  onConfirmDelivery,
  type,
}: {
  payments: Payment[]
  onVerify: (paymentId: string, dueId: string) => void
  onUnverify: (paymentId: string, dueId: string) => void
  onConfirmDelivery: (paymentId: string, dueId: string) => void
  type: "pending" | "verified"
}) {
  return (
    <div className="grid gap-4">
      {payments.map((payment) => (
        <Card key={payment.id} className="rounded-none border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground text-lg">{payment.dueTitle}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {payment.studentName} ({payment.studentMatric})
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-card-foreground">Account Name:</span>
                  <span className="ml-2 text-muted-foreground">{payment.accountName}</span>
                </div>
                <div>
                  <span className="font-semibold text-card-foreground">Amount Paid:</span>
                  <span className="ml-2 text-muted-foreground">₦{payment.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-card-foreground">Status:</span>
                  <span
                    className={`ml-2 font-semibold ${
                      payment.verified ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {payment.verified ? "VERIFIED" : "PENDING"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-card-foreground">Paid At:</span>
                  <span className="ml-2 text-muted-foreground">{new Date(payment.paidAt).toLocaleString()}</span>
                </div>
                {payment.verifiedAt && (
                  <div>
                    <span className="font-semibold text-card-foreground">Verified At:</span>
                    <span className="ml-2 text-muted-foreground">{new Date(payment.verifiedAt).toLocaleString()}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-card-foreground">Payment ID:</span>
                  <span className="ml-2 text-muted-foreground text-xs">{payment.id}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {type === "pending" && (
                <Button
                  onClick={() => onVerify(payment.id, payment.dueId)}
                  className="bg-green-600 text-white hover:bg-green-700 rounded-none"
                >
                  Verify Payment
                </Button>
              )}

              {type === "verified" && (
                <Button
                  onClick={() => onUnverify(payment.id, payment.dueId)}
                  className="bg-red-600 text-white hover:bg-red-700 rounded-none"
                >
                  Unverify Payment
                </Button>
              )}

              {payment.verified && !payment.manualDelivered && (
                <Button
                  onClick={() => onConfirmDelivery(payment.id, payment.dueId)}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-none"
                >
                  Confirm Delivery
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {payments.length === 0 && (
        <Card className="rounded-none border-border bg-card">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              {type === "pending" ? "No pending payments to verify" : "No verified payments"}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
