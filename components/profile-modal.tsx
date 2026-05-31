"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileModalProps {
  profile: {
    name: string
    matric: string
    email: string
    phone?: string
  }
  onUpdate: (phone: string) => void
  onClose: () => void
}

export default function ProfileModal({ profile, onUpdate, onClose }: ProfileModalProps) {
  const [phone, setPhone] = useState(profile.phone || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(phone)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md rounded-none border-black bg-white">
        <CardHeader>
          <CardTitle className="text-black">Student Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-black">Full Name</Label>
              <Input value={profile.name} disabled className="rounded-none border-black bg-gray-50" />
            </div>

            <div>
              <Label className="text-black">Matric Number</Label>
              <Input value={profile.matric} disabled className="rounded-none border-black bg-gray-50" />
            </div>

            <div>
              <Label className="text-black">Email</Label>
              <Input value={profile.email} disabled className="rounded-none border-black bg-gray-50" />
            </div>

            <div>
              <Label htmlFor="phone" className="text-black">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-none border-black"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800 rounded-none">
                Update Phone
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
