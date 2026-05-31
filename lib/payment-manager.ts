import { ref, push, set, onValue, off, get } from "firebase/database"
import { database } from "@/lib/firebase"

export interface Payment {
  id: string
  studentMatric: string
  studentName: string
  dueId: string
  dueTitle: string
  accountName: string
  amount: number
  status: "paid" | "verified"
  verified: boolean
  manualDelivered: boolean
  paidAt: string
  verifiedAt?: string
}

export class PaymentManager {
  // Create a new payment entry in /payments/{dueId} array
  static async createPayment(
    studentMatric: string,
    studentName: string,
    dueId: string,
    dueTitle: string,
    accountName: string,
    amount: number,
  ): Promise<void> {
    // Check if payment already exists for this student and due
    const existingPayment = await this.getPaymentByStudentAndDue(studentMatric, dueId)
    if (existingPayment) {
      throw new Error("Payment already exists for this due")
    }

    const paymentsRef = ref(database, `payments/${dueId}`)
    const newPaymentRef = push(paymentsRef)

    const payment = {
      studentMatric,
      studentName,
      dueId,
      dueTitle,
      accountName,
      amount,
      status: "paid",
      verified: false,
      manualDelivered: false,
      paidAt: new Date().toISOString(),
    }

    await set(newPaymentRef, payment)
  }

  // Get payment by student and due
  static async getPaymentByStudentAndDue(studentMatric: string, dueId: string): Promise<Payment | null> {
    const paymentsRef = ref(database, `payments/${dueId}`)
    const snapshot = await get(paymentsRef)

    if (snapshot.exists()) {
      const payments = snapshot.val()
      const paymentEntry = Object.entries(payments).find(
        ([_, payment]: [string, any]) => payment.studentMatric === studentMatric,
      )

      if (paymentEntry) {
        const [id, payment] = paymentEntry
        return { id, ...payment } as Payment
      }
    }

    return null
  }

  // Get all payments for a specific student across all dues
  static getPaymentsByStudent(studentMatric: string, callback: (payments: Payment[]) => void): () => void {
    const paymentsRef = ref(database, "payments")

    const listener = onValue(paymentsRef, (snapshot) => {
      const allPayments: Payment[] = []

      if (snapshot.exists()) {
        const paymentsData = snapshot.val()

        // Iterate through each dueId
        Object.entries(paymentsData).forEach(([dueId, duePayments]: [string, any]) => {
          if (duePayments) {
            // Iterate through payments for this due
            Object.entries(duePayments).forEach(([paymentId, payment]: [string, any]) => {
              if (payment.studentMatric === studentMatric) {
                allPayments.push({
                  id: paymentId,
                  ...payment,
                } as Payment)
              }
            })
          }
        })
      }

      callback(allPayments)
    })

    return () => off(paymentsRef, "value", listener)
  }

  // Get all payments for a specific due
  static getPaymentsByDue(dueId: string, callback: (payments: Payment[]) => void): () => void {
    const paymentsRef = ref(database, `payments/${dueId}`)

    const listener = onValue(paymentsRef, (snapshot) => {
      const payments: Payment[] = []

      if (snapshot.exists()) {
        const paymentsData = snapshot.val()
        Object.entries(paymentsData).forEach(([id, payment]: [string, any]) => {
          payments.push({
            id,
            ...payment,
          } as Payment)
        })
      }

      callback(payments)
    })

    return () => off(paymentsRef, "value", listener)
  }

  // Get all payments across all dues
  static getAllPayments(callback: (payments: Payment[]) => void): () => void {
    const paymentsRef = ref(database, "payments")

    const listener = onValue(paymentsRef, (snapshot) => {
      const allPayments: Payment[] = []

      if (snapshot.exists()) {
        const paymentsData = snapshot.val()

        // Iterate through each dueId
        Object.entries(paymentsData).forEach(([dueId, duePayments]: [string, any]) => {
          if (duePayments) {
            // Iterate through payments for this due
            Object.entries(duePayments).forEach(([paymentId, payment]: [string, any]) => {
              allPayments.push({
                id: paymentId,
                ...payment,
              } as Payment)
            })
          }
        })
      }

      callback(allPayments)
    })

    return () => off(paymentsRef, "value", listener)
  }

  // Verify a payment (change status to "verified" and set verified: true)
  static async verifyPayment(paymentId: string, dueId: string): Promise<void> {
    const paymentRef = ref(database, `payments/${dueId}/${paymentId}`)
    const snapshot = await get(paymentRef)

    if (snapshot.exists()) {
      const payment = snapshot.val()
      await set(paymentRef, {
        ...payment,
        status: "verified",
        verified: true,
        verifiedAt: new Date().toISOString(),
      })
    }
  }

  // Unverify a payment (change status back to "paid" and set verified: false)
  static async unverifyPayment(paymentId: string, dueId: string): Promise<void> {
    const paymentRef = ref(database, `payments/${dueId}/${paymentId}`)
    const snapshot = await get(paymentRef)

    if (snapshot.exists()) {
      const payment = snapshot.val()
      const { verifiedAt, ...paymentWithoutVerifiedAt } = payment
      await set(paymentRef, {
        ...paymentWithoutVerifiedAt,
        status: "paid",
        verified: false,
      })
    }
  }

  // Confirm manual delivery
  static async confirmDelivery(paymentId: string, dueId: string): Promise<void> {
    const paymentRef = ref(database, `payments/${dueId}/${paymentId}/manualDelivered`)
    await set(paymentRef, true)
  }

  // Find payment across all dues by payment ID
  static async findPaymentById(paymentId: string): Promise<{ payment: Payment; dueId: string } | null> {
    const paymentsRef = ref(database, "payments")
    const snapshot = await get(paymentsRef)

    if (snapshot.exists()) {
      const paymentsData = snapshot.val()

      for (const [dueId, duePayments] of Object.entries(paymentsData)) {
        if (duePayments && typeof duePayments === "object") {
          for (const [id, payment] of Object.entries(duePayments as Record<string, any>)) {
            if (id === paymentId) {
              return {
                payment: { id, ...payment } as Payment,
                dueId,
              }
            }
          }
        }
      }
    }

    return null
  }
}
