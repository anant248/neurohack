import { type ButtonHTMLAttributes, type ReactNode } from "react"

type ButtonVariant = "primary" | "secondary" | "stop" | "ghost"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "primary-btn",
  secondary: "secondary-btn",
  stop: "stop-btn",
  ghost: "retry-btn",
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const base = variantClass[variant]
  const disabledClass = props.disabled ? "disabled" : ""
  return (
    <button className={`${base} ${disabledClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
