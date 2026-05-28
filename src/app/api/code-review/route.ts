import { type NextRequest } from "next/server"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { buildCodeReviewPrompt } from "@/lib/codeReviewPrompt"

const RequestSchema = z.object({
  code: z.string().min(1).max(10000),
  language: z.enum(["js", "py"]),
  problemTitle: z.string().min(1).max(300),
  problemContent: z.string().min(1).max(20000),
})

export type CodeReviewRequest = z.infer<typeof RequestSchema>

export interface CodeReviewResponse {
  review: string
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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("[/api/code-review] GOOGLE_GENERATIVE_AI_API_KEY is not set")
      return Response.json({ error: "AI review unavailable" }, { status: 503 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: { maxOutputTokens: 400 },
    })

    const prompt = buildCodeReviewPrompt(parsed.data)
    const result = await model.generateContent(prompt)
    const review = result.response.text().trim()

    return Response.json({ review } satisfies CodeReviewResponse)
  } catch (error) {
    console.error("[/api/code-review]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
