"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Due {
  id: string
  title: string
  amount: number
  description: string
}

interface PaymentModalProps {
  due: Due
  onSubmit: (dueId: string, accountName: string, amount: number) => void
  onClose: () => void
}

export default function PaymentModal({ due, onSubmit, onClose }: PaymentModalProps) {
  const [accountName, setAccountName] = useState("")
  const [amount, setAmount] = useState(due.amount.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountName.trim()) {
      alert("Please enter account name")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (numAmount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    onSubmit(due.id, accountName.trim(), numAmount)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md rounded-none border-black bg-white">
        <CardHeader>
          <CardTitle className="text-black">Submit Payment</CardTitle>
          <div className="text-sm text-gray-600">{due.title}</div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accountName" className="text-black">
                Account Name Used
              </Label>
              <Input
                id="accountName"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="rounded-none border-black"
                placeholder="Enter the account name you used for payment"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-black">
                Amount Paid
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-none border-black"
                placeholder="Enter amount paid"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="bg-gray-50 p-3 rounded border text-sm">
              <div className="font-semibold text-black mb-1">Payment Instructions:</div>
              <p className="text-gray-700">{due.description}</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800 rounded-none">
                Submit Payment
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-none border-black text-black hover:bg-black hover:text-white bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
