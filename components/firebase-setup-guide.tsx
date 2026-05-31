"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function FirebaseSetupGuide() {
  const envVars = [
    { key: "NEXT_PUBLIC_FIREBASE_API_KEY", value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
    { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN },
    { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
    { key: "NEXT_PUBLIC_FIREBASE_DATABASE_URL", value: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL },
    { key: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID },
    { key: "NEXT_PUBLIC_FIREBASE_APP_ID", value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
  ]

  const allConfigured = envVars.every(({ value }) => value && value.length > 0)

  if (allConfigured) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl rounded-none border-black bg-white">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Firebase Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 border border-red-200">
            <p className="text-red-800 text-sm">
              <strong>CONFIGURATION_NOT_FOUND</strong> error detected. Please complete Firebase setup:
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-black">Required Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Go to{" "}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Firebase Console
                </a>
              </li>
              <li>
                Select your project: <code className="bg-gray-100 px-1">FST RECORDER-36fbb</code>
              </li>
              <li>
                Enable <strong>Authentication</strong> → Sign-in method → Email/Password
              </li>
              <li>
                Enable <strong>Realtime Database</strong> → Create database
              </li>
              <li>Verify your environment variables below</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-black">Environment Variables Status:</h3>
            <div className="space-y-1">
              {envVars.map(({ key, value }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {value ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <code className="bg-gray-100 px-1">{key}</code>
                  <span className="text-gray-600">{value ? "✓ Set" : "✗ Missing"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Test Credentials:</strong>
              <br />
              Student: Matric <code>20231376642</code> + Password <code>FST RECORDER1</code>
              <br />
              CourseRep: Username <code>@ep.saviour</code> + Password <code>#FST01</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
