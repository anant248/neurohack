"use client"

import Link from "next/link"
import { useState } from "react"

export function Footer() {
  const [copied, setCopied] = useState(false)

  const getAppUrl = () =>
    typeof window !== "undefined" ? window.location.origin : "https://neurohack25.vercel.app"

  const shareText =
    "Check out Interprep — AI Interview Coach! Practice behavioral & technical interviews with real-time AI feedback."

  const handleShare = (platform: "facebook" | "twitter" | "copy") => {
    const url = getAppUrl()
    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer",
      )
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <Link href="/" className="footer-logo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                fill="currentColor"
              />
            </svg>
            Interprep
          </Link>
          <p className="footer-privacy">
            Your resume is stored locally in your browser and never leaves your device.
          </p>
        </div>

        <div className="footer-right">
          <a
            href="https://buymeacoffee.com/anantg"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-bmc"
            title="Buy me a coffee"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="6" y1="1" x2="6" y2="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="10" y1="1" x2="10" y2="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="14" y1="1" x2="14" y2="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </a>

          <button
            className="footer-share-btn"
            onClick={() => handleShare("facebook")}
            title="Share on Facebook"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </button>

          <button
            className="footer-share-btn"
            onClick={() => handleShare("twitter")}
            title="Share on X"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>

          <button
            className={`footer-share-btn${copied ? " footer-share-btn--copied" : ""}`}
            onClick={() => handleShare("copy")}
            title={copied ? "Copied!" : "Copy link"}
            type="button"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </footer>
  )
}
