import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { FeedbackBubble } from "@/components/FeedbackBubble"
import { Footer } from "@/components/Footer"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Interprep — AI Interview Coach",
  description: "Practice interviews with real-time AI feedback on eye contact, expression, and more.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Aurora layer — fixed, sits behind all page content */}
        <div className="aurora-bg" aria-hidden="true" />
        {/* Site shell — flex column so footer is always at the bottom */}
        <div className="site-shell">
          <div className="site-content">{children}</div>
          <Footer />
        </div>
        <FeedbackBubble />
      </body>
    </html>
  )
}
