"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConfirmationModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({ title, message, onConfirm, onCancel }: ConfirmationModalProps) {
  const [countdown, setCountdown] = useState(5)
  const [canConfirm, setCanConfirm] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanConfirm(true)
    }
  }, [countdown])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md rounded-none border-black bg-white">
        <CardHeader>
          <CardTitle className="text-black">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">{message}</p>

          {!canConfirm && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-black">{countdown}</div>
              <div className="text-sm text-gray-600">Please wait...</div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={onConfirm}
              disabled={!canConfirm}
              className="flex-1 bg-black text-white hover:bg-gray-800 rounded-none disabled:bg-gray-300"
            >
              {canConfirm ? "Confirm" : `Wait ${countdown}s`}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 rounded-none border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
