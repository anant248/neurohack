"use client"

import { useState, useCallback, useEffect } from "react"

const STORAGE_KEY = "interprep-resume-text"

export function useResume() {
  const [resumeText, setResumeText] = useState("")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setResumeText(saved)
    } catch {
      // localStorage unavailable (SSR, private browsing)
    }
  }, [])

  const saveResume = useCallback((text: string) => {
    setResumeText(text)
    try {
      localStorage.setItem(STORAGE_KEY, text)
    } catch {
      // ignore write failures
    }
  }, [])

  return { resumeText, saveResume }
}
