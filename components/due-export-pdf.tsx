"use client"

import { useState } from "react"
import ExportOptionsModal from "@/components/export-options-modal"
import studentsData from "@/data/students.json"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DueExportPDFProps {
  due: any
  payments: any[]
  onClose: () => void
}

export default function DueExportPDF({ due, payments, onClose }: DueExportPDFProps) {
  const [showExportModal, setShowExportModal] = useState(true)

  const generateExport = async (type: "all" | "paid" | "unpaid" | "verified") => {
    try {
      const currentDate = new Date().toLocaleDateString()
      const currentTime = new Date().toLocaleTimeString()

      // Build rows
      const rows: any[] = []
      let sn = 1

      studentsData.forEach((student) => {
        const payment = payments.find((p) => p.studentMatric === student.matric)

        const isPaid = payment?.status === "paid"
        const isVerified = payment?.verified || false
        const isDelivered = payment?.manualDelivered || false

        let status = "Unpaid"
        if (isVerified && isDelivered) status = "Delivered"
        else if (isVerified) status = "Verified"
        else if (isPaid) status = "Paid"

        if (type === "paid" && !isPaid) return
        if (type === "unpaid" && isPaid) return
        if (type === "verified" && !isVerified) return

        rows.push([
          sn,
          student.name,
          student.matric,
          status,
          isDelivered ? "✓" : "✗",
        ])
        sn++
      })

      const doc = new jsPDF()

      // Title
      doc.setFontSize(18)
      doc.text("FST RECORDER - UNIVERSITY DUES MANAGEMENT SYSTEM", 14, 20)
      doc.setFontSize(14)
      doc.text("DUE PAYMENT REPORT", 14, 30)

      // Due Info
      const infoY = 40
      doc.setFontSize(12)
      doc.text(`Title: ${due.title}`, 14, infoY)
      doc.text(`Amount: ₦${due.amount?.toLocaleString()}`, 14, infoY + 7)
      doc.text(`Level: ${due.level}`, 14, infoY + 28)
      doc.text(`Semester: ${due.semester}`, 14, infoY + 35)
      doc.text(`Created: ${new Date(due.createdAt).toLocaleDateString()}`, 14, infoY + 49)
      // doc.text(`Deadline: ${new Date(due.deadline).toLocaleDateString()}`, 14, infoY + 42)
      

      // Report Meta
      const metaY = infoY + 63
      doc.text(`Generated: ${currentDate} at ${currentTime}`, 14, metaY)
      // doc.text(`Filter Applied: ${type}`, 14, metaY + 7)
      doc.text(`Total Records: ${rows.length}`, 14, metaY + 14)
      doc.text(`Total Students in Class: ${studentsData.length}`, 14, metaY + 21)

      // Table Headers
      autoTable(doc, {
        startY: metaY + 30,
        head: [[
          "SN",
          "Name",
          "Matric",
          "Status",
          "Delivered",
        ]],
        body: rows,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255,
          fontStyle: "bold",
        },
      })

      const filename = `${due.title.replace(/[^a-zA-Z0-9]/g, "_")}_${type}_report.pdf`
      doc.save(filename)

      toast.success("PDF exported successfully!")
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Failed to export PDF")
    }
  }

  return (
    <ExportOptionsModal
      isOpen={showExportModal}
      onClose={onClose}
      onExport={generateExport}
      title={due.title}
    />
  )
}
