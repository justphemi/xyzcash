"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: "default" | "destructive"
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmationDialogProps) {
  const [countdown, setCountdown] = useState(3)
  const [canConfirm, setCanConfirm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCountdown(3)
      setCanConfirm(false)

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanConfirm(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

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
              className={`flex-1 rounded-none disabled:bg-gray-300 ${
                variant === "destructive"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {canConfirm ? confirmText : `Wait ${countdown}s`}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 rounded-none border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              {cancelText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
