import { type ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  variant?: "default" | "question" | "results"
}

const variantClass: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "card",
  question: "question-card",
  results: "results-card",
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  return (
    <div className={`${variantClass[variant]} ${className}`.trim()}>
      {children}
    </div>
  )
}
