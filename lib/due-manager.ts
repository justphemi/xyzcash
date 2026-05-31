import { ref, push, set, onValue, off, remove, get } from "firebase/database"
import { database } from "@/lib/firebase"

export interface Due {
  id: string
  title: string
  amount: number
  description: string
  category: string
  semester: string
  level: string
  deadline: string
  createdAt: string
  createdBy: string
}

export class DueManager {
  // Create a new due
  static async createDue(dueData: Omit<Due, "id" | "createdAt" | "createdBy">): Promise<void> {
    const duesRef = ref(database, "dues")
    const newDueRef = push(duesRef)

    await set(newDueRef, {
      ...dueData,
      createdAt: new Date().toISOString(),
      createdBy: "@ep.saviour",
    })
  }

  // Get all dues with real-time updates
  static getAllDues(callback: (dues: Due[]) => void): () => void {
    const duesRef = ref(database, "dues")

    const listener = onValue(duesRef, (snapshot) => {
      const dues: Due[] = []

      if (snapshot.exists()) {
        const duesData = snapshot.val()
        Object.entries(duesData).forEach(([id, due]: [string, any]) => {
          dues.push({
            id,
            ...due,
          } as Due)
        })
      }

      callback(dues)
    })

    return () => off(duesRef, "value", listener)
  }

  // Get a specific due by ID
  static async getDueById(dueId: string): Promise<Due | null> {
    const dueRef = ref(database, `dues/${dueId}`)
    const snapshot = await get(dueRef)

    if (snapshot.exists()) {
      return {
        id: dueId,
        ...snapshot.val(),
      } as Due
    }

    return null
  }

  // Delete a due (only allowed within 2 hours of creation)
  static async deleteDue(dueId: string): Promise<void> {
    const due = await this.getDueById(dueId)

    if (!due) {
      throw new Error("Due not found")
    }

    if (!this.canDeleteDue(due)) {
      throw new Error("Cannot delete due after 2 hours of creation")
    }

    // Delete the due
    const dueRef = ref(database, `dues/${dueId}`)
    await remove(dueRef)

    // Delete all payments for this due
    const paymentsRef = ref(database, `payments/${dueId}`)
    await remove(paymentsRef)
  }

  // Check if a due can be deleted (within 2 hours of creation)
  static canDeleteDue(due: Due): boolean {
    const createdAt = new Date(due.createdAt)
    const now = new Date()
    const twoHoursInMs = 2 * 60 * 60 * 1000

    return now.getTime() - createdAt.getTime() < twoHoursInMs
  }

  // Get time until deletion expiry
  static getTimeUntilDeletionExpiry(due: Due): string {
    const createdAt = new Date(due.createdAt)
    const now = new Date()
    const twoHoursInMs = 2 * 60 * 60 * 1000
    const timeElapsed = now.getTime() - createdAt.getTime()
    const timeRemaining = twoHoursInMs - timeElapsed

    if (timeRemaining <= 0) {
      return "Deletion period expired"
    }

    const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000))
    const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))

    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m remaining to delete`
    } else {
      return `${minutesRemaining}m remaining to delete`
    }
  }
}
