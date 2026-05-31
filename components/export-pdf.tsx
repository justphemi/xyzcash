"use client"

import { Button } from "@/components/ui/button"
import studentsData from "@/data/students.json"

interface ExportPDFProps {
  dues: any[]
  students: any
}

export default function ExportPDF({ dues, students }: ExportPDFProps) {
  const generatePDF = async (type: "all" | "paid" | "unpaid") => {
    // This would typically use a library like jsPDF
    // For now, we'll create a simple CSV export

    const headers = [
      "SN",
      "Name",
      "Matric",
      "Due Title",
      "Amount",
      "Paid",
      "Verified",
      "Delivered",
      "Paid Date",
      "Verified Date",
    ]
    const rows: string[][] = []

    let sn = 1

    studentsData.forEach((student) => {
      dues.forEach((due) => {
        const payment = students[student.matric]?.payments?.[due.id]

        const isPaid = payment?.status === "paid"
        const isVerified = payment?.verified || false
        const isDelivered = payment?.manualDelivered || false

        // Filter based on type
        if (type === "paid" && !isPaid) return
        if (type === "unpaid" && isPaid) return

        rows.push([
          sn.toString(),
          student.name,
          student.matric,
          due.title,
          `₦${due.amount.toLocaleString()}`,
          isPaid ? "Yes" : "No",
          isVerified ? "Yes" : "No",
          isDelivered ? "Yes" : "No",
          payment?.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-",
          payment?.verifiedAt ? new Date(payment.verifiedAt).toLocaleDateString() : "-",
        ])

        sn++
      })
    })

    // Create CSV content
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dues-report-${type}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => generatePDF("all")}
        variant="outline"
        className="rounded-none border-black text-black hover:bg-black hover:text-white"
      >
        Export All
      </Button>
      <Button
        onClick={() => generatePDF("paid")}
        variant="outline"
        className="rounded-none border-black text-black hover:bg-black hover:text-white"
      >
        Export Paid Only
      </Button>
      <Button
        onClick={() => generatePDF("unpaid")}
        variant="outline"
        className="rounded-none border-black text-black hover:bg-black hover:text-white"
      >
        Export Unpaid Only
      </Button>
    </div>
  )
}
