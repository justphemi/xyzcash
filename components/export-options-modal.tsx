"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

interface ExportOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (type: "all" | "paid" | "unpaid" | "verified") => void
  title: string
}

export default function ExportOptionsModal({ isOpen, onClose, onExport, title }: ExportOptionsModalProps) {
  if (!isOpen) return null

  const exportOptions = [
    { type: "all" as const, label: "All Students", description: "Export complete list of all students" },
    { type: "unpaid" as const, label: "Unpaid Only", description: "Export students who haven't paid" },
    { type: "paid" as const, label: "Paid Only", description: "Export students who paid but not verified" },
    { type: "verified" as const, label: "Verified Only", description: "Export students with verified payments" },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md rounded-none border-black bg-white">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {title}
          </CardTitle>
          <p className="text-sm text-gray-600">Choose which students to include in the export</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <Button
                key={option.type}
                onClick={() => {
                  onExport(option.type)
                  onClose()
                }}
                variant="outline"
                className="w-full rounded-none border-black text-black hover:bg-black hover:text-white bg-transparent text-left justify-start h-auto p-4"
              >
                <div>
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm opacity-70">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full rounded-none border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
