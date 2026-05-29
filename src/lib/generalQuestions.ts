import type { TailoredQuestion } from "@/lib/types"

/**
 * General behavioural questions used when the user practices
 * without providing a resume / job description.
 */
export const GENERAL_BEHAVIORAL_QUESTIONS: TailoredQuestion[] = [
  {
    text: "Tell me about a time you led a team through a difficult challenge.",
    category: "Leadership",
    starHint: "Focus on your specific leadership actions and how you motivated the team.",
  },
  {
    text: "Describe a situation where you had to resolve a conflict with a colleague.",
    category: "Teamwork",
    starHint: "Emphasise empathy, listening, and the constructive outcome you achieved.",
  },
  {
    text: "Give an example of when you had to adapt quickly to a significant change.",
    category: "Adaptability",
    starHint: "Show your mindset shift and concrete steps you took to re-orient.",
  },
  {
    text: "Tell me about your most significant professional achievement.",
    category: "Achievement",
    starHint: "Quantify the impact — numbers make results tangible.",
  },
  {
    text: "Describe a time you failed and what you learned from it.",
    category: "Growth",
    starHint: "Be honest about the failure, then focus heavily on the lesson and follow-up actions.",
  },
  {
    text: "Tell me about a time you had to make a difficult decision under pressure.",
    category: "Decision-Making",
    starHint: "Walk through your reasoning process and how you weighed trade-offs.",
  },
  {
    text: "Describe a situation where you went above and beyond for a customer or stakeholder.",
    category: "Initiative",
    starHint: "Highlight what motivated you to go further than required.",
  },
  {
    text: "Tell me about a time you disagreed with your manager and how you handled it.",
    category: "Communication",
    starHint: "Show respect and professionalism while also demonstrating your own judgment.",
  },
  {
    text: "Give an example of how you managed multiple competing priorities.",
    category: "Time Management",
    starHint: "Explain your prioritisation framework and what trade-offs you made.",
  },
  {
    text: "Tell me about a time you had to learn something new very quickly.",
    category: "Learning",
    starHint: "Detail the strategies you used to accelerate your learning.",
  },
]
