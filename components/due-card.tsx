"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Due {
  id: string
  title: string
  amount: number
  description: string
  category: string
  semester: string
  level: string
  deadline: string
}

interface Payment {
  accountName: string
  amount: number
  status: string
  verified: boolean
  manualDelivered: boolean
  paidAt: string
  verifiedAt?: string
}

interface DueCardProps {
  due: Due
  payment?: Payment
  onPayClick?: () => void
  onConfirmDelivery?: () => void
}

export default function DueCard({ due, payment, onPayClick, onConfirmDelivery }: DueCardProps) {
  const getStatusColor = () => {
    if (!payment) return "text-red-600 dark:text-red-400"
    if (payment.verified) return "text-green-600 dark:text-green-400"
    if (payment.status === "paid") return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getStatusText = () => {
    if (!payment) return "UNPAID"
    if (payment.verified && payment.manualDelivered) return "DELIVERED"
    if (payment.verified) return "VERIFIED"
    if (payment.status === "paid" && !payment.verified) return "PAID"
    return "UNPAID"
  }

  const isOverdue = new Date(due.deadline) < new Date()

  return (
    <Card
      className={`rounded-none border-border bg-card ${isOverdue && !payment?.verified ? "border-red-500 dark:border-red-400" : ""}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-card-foreground text-lg">{due.title}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              FST {due.level} {due.semester} Semester
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-card-foreground">₦{due.amount.toLocaleString()}</div>
            <div className={`text-sm font-semibold ${getStatusColor()}`}>{getStatusText()}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="">
          <span className="font-semibold text-card-foreground">Payment Info:</span>
          <p className="text-muted-foreground">{due.description}</p>

          <div className="flex flex-col gap-2 text-sm mt-1">
            <div>
              <span className="font-semibold text-card-foreground">Category:</span>
              <span className="ml-2 text-muted-foreground">{due.category}</span>
            </div>
            <div>
              <span className="font-semibold text-card-foreground">Deadline:</span>
              <span className={`ml-2 ${isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                {new Date(due.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          {payment && (
            <div className="bg-muted p-3 rounded border border-border">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold text-card-foreground">Account Name:</span>
                  <span className="ml-2 text-muted-foreground">{payment.accountName}</span>
                </div>
                <div>
                  <span className="font-semibold text-card-foreground">Amount Paid:</span>
                  <span className="ml-2 text-muted-foreground">₦{payment.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-card-foreground">Paid At:</span>
                  <span className="ml-2 text-muted-foreground">{new Date(payment.paidAt).toLocaleDateString()}</span>
                </div>
                {payment.verifiedAt && (
                  <div>
                    <span className="font-semibold text-card-foreground">Verified At:</span>
                    <span className="ml-2 text-muted-foreground">
                      {new Date(payment.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!payment && onPayClick && (
              <Button
                onClick={onPayClick}
                className="bg-primary sm:w-full text-primary-foreground hover:bg-primary/90 rounded-none"
              >
                I've Paid
              </Button>
            )}

            {payment?.verified && !payment.manualDelivered && onConfirmDelivery && (
              <Button onClick={onConfirmDelivery} className="bg-green-600 text-white hover:bg-green-700 rounded-none">
                Confirm Delivery
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
