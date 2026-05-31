import { initializeApp, getApps, type FirebaseOptions } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

/**
 * Helper to read NEXT_PUBLIC_* env-vars at build time.
 * Falls back to empty string so we can detect missing values.
 */
const env = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
}

/**
 * Throw a descriptive error (or warn in prod) if ANY env is missing.
 */
const missing = Object.entries(env)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missing.length) {
  const message = `[FST RECORDER] Missing Firebase env variables: ${missing.join(
    ", ",
  )}.  \nAdd them to your .env.local file.`
  if (process.env.NODE_ENV === "development") {
    // Easier DX in dev
    console.warn(message)
  } else {
    throw new Error(message)
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: env.apiKey,
  authDomain: env.authDomain,
  projectId: env.projectId,
  databaseURL: env.databaseURL,
  messagingSenderId: env.messagingSenderId,
  appId: env.appId,
}

// Initialize Firebase app only once
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Auth and Database
export const auth = getAuth(app)
export const database = getDatabase(app)

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Only connect to emulators if not already connected
  try {
    if (!auth.config.emulator) {
      // connectAuthEmulator(auth, "http://localhost:9099")
    }
    if (!database.app) {
      // connectDatabaseEmulator(database, "localhost", 9000)
    }
  } catch (error) {
    // Emulators already connected or not available
    console.log("Firebase emulators not connected:", error)
  }
}
