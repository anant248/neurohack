import { type NextRequest } from "next/server"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { buildFeedbackPrompt } from "@/lib/prompts"

const RequestSchema = z.object({
  eyeContactScore: z.number().int().min(0).max(100),
  expressionScore: z.number().int().min(0).max(100),
  question: z.string().min(1).max(500),
  previousScores: z
    .array(
      z.object({
        eyeContactScore: z.number(),
        expressionScore: z.number(),
      }),
    )
    .optional(),
})

export type FeedbackRequest = z.infer<typeof RequestSchema>

export interface FeedbackResponse {
  feedback: string
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.format() }, { status: 400 })
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("[/api/feedback] GEMINI_API_KEY is not set")
      return Response.json({ error: "AI feedback unavailable" }, { status: 503 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { maxOutputTokens: 200 },
    })

    const prompt = buildFeedbackPrompt(parsed.data)
    const result = await model.generateContent(prompt)
    const feedback = result.response.text().trim()

    return Response.json({ feedback } satisfies FeedbackResponse)
  } catch (error) {
    console.error("[/api/feedback]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
