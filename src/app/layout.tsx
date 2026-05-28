import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { FeedbackBubble } from "@/components/FeedbackBubble"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Interprep — AI Interview Coach",
  description: "Practice interviews with real-time AI feedback on eye contact, expression, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <FeedbackBubble />
      </body>
    </html>
  )
}
