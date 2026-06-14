import type { CoffeeChat } from "@/lib/types"

export const SUGGESTED_QUESTIONS = [
  "What does a typical day look like in your role?",
  "How did you break into this industry / role?",
  "What skills have been most valuable to you in your career?",
  "What's the biggest challenge you face in your day-to-day work?",
  "What do you wish you'd known before starting this role?",
  "How does your team collaborate on projects?",
  "What does career progression look like from your current position?",
  "What resources, communities, or habits have helped you grow the most?",
  "What's the culture like at your company?",
  "Are there any upcoming opportunities at your company I should know about?",
  "What advice would you give someone trying to get into your field?",
  "What's your proudest achievement in this role?",
  "How do you stay current with trends in your industry?",
  "What would you do differently if you were starting your career over?",
  "Is there anyone else you'd recommend I speak with?",
]

export function emptyCoffeeChat(): Omit<CoffeeChat, "id" | "createdAt" | "updatedAt"> {
  return {
    personName: "",
    company: "",
    role: "",
    date: new Date().toISOString().split("T")[0],
    format: "virtual",
    questions: [],
  }
}
