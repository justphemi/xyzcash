"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreateDueFormProps {
  onSubmit: (dueData: any) => void
  onClose: () => void
}

export default function CreateDueForm({ onSubmit, onClose }: CreateDueFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    description: "",
    instructions: "",
    deadline: "",
    level: "100L",
    semester: "First",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.amount || !formData.deadline) {
      alert("Please fill in all required fields")
      return
    }

    const dueData = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      deadline: new Date(formData.deadline).toISOString(),
    }

    onSubmit(dueData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl rounded-none border-black bg-white my-8">
        <CardHeader>
          <CardTitle className="text-black">Create New Due</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-black">
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="rounded-none border-black"
                  placeholder="e.g., CSC309 Textbook"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-black">
                  Category
                </Label>
                <Input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="rounded-none border-black"
                  placeholder="e.g., Books, Registration"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-black">
                  Amount (₦) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  className="rounded-none border-black"
                  placeholder="3000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-black">
                  Deadline *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  className="rounded-none border-black"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level" className="text-black">
                  Level
                </Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                  className="w-full px-3 py-2 border border-black rounded-none bg-white"
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                  <option value="600L">600L</option>
                </select>
              </div>

              <div>
                <Label htmlFor="semester" className="text-black">
                  Semester
                </Label>
                <select
                  id="semester"
                  value={formData.semester}
                  onChange={(e) => handleChange("semester", e.target.value)}
                  className="w-full px-3 py-2 border border-black rounded-none bg-white"
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-black">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="rounded-none border-black"
                placeholder="Brief description of the due"
                rows={3}
              />
            </div>

            <div className="hidden">
              <Label htmlFor="instructions" className="text-black">
                Payment Instructions
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleChange("instructions", e.target.value)}
                className="rounded-none border-black"
                placeholder="Instructions for payment (bank details, etc.)"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800 rounded-none">
                Create Due
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
