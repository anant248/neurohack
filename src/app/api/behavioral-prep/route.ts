import { type NextRequest } from "next/server"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { BehavioralPrepResponse } from "@/lib/types"

const RequestSchema = z.object({
  resumeText: z.string().min(1).max(20000),
  jobDescriptionText: z.string().min(1).max(20000),
})

export type BehavioralPrepRequest = z.infer<typeof RequestSchema>

function buildBehavioralPrepPrompt(resumeText: string, jdText: string): string {
  return `You are a senior career coach and interview preparation expert. Analyse the resume and job description below, then return a JSON object with the exact shape shown.

RESUME:
${resumeText.trim()}

JOB DESCRIPTION:
${jdText.trim()}

Return ONLY a valid JSON object — no markdown fences, no commentary — matching this exact schema:
{
  "companyName": "string — company name extracted from the JD",
  "role": "string — job title extracted from the JD",
  "companyBlurb": "string — 2–3 sentences: what the company does, its stage/scale, and one thing that makes this role compelling. Base this on the JD and your training knowledge.",
  "companyLink": "string — the company's main website URL (e.g. https://example.com) or LinkedIn URL if unsure. Must start with https://",
  "questions": [
    {
      "text": "string — a specific behavioural interview question tailored to this role and the candidate's background",
      "category": "string — one of: Teamwork, Leadership, Conflict, Growth, General",
      "starHint": "string — one sentence of STAR framework scaffolding specific to this question (e.g. 'Describe the team size and your role (S/T), the specific actions you took (A), and the measurable outcome (R).')"
    }
  ]
}

Rules:
- Generate exactly 8–10 questions in the "questions" array
- Questions must be tailored to the specific role and the candidate's actual experience on the resume
- Spread questions across at least 3 of the 5 categories
- Each starHint must be concise (one sentence, ≤ 30 words) and question-specific
- companyLink must be a valid URL starting with https://
- Return ONLY the JSON object, nothing else`
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

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error("[/api/behavioral-prep] GOOGLE_GENERATIVE_AI_API_KEY is not set")
    return Response.json({ error: "AI service unavailable" }, { status: 503 })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      },
    })

    const prompt = buildBehavioralPrepPrompt(parsed.data.resumeText, parsed.data.jobDescriptionText)
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    let data: BehavioralPrepResponse
    try {
      data = JSON.parse(raw) as BehavioralPrepResponse
    } catch {
      console.error("[/api/behavioral-prep] Failed to parse Gemini JSON:", raw.slice(0, 200))
      return Response.json({ error: "AI returned malformed response" }, { status: 500 })
    }

    // Basic shape validation
    if (
      !data.companyName ||
      !data.role ||
      !data.companyBlurb ||
      !data.companyLink ||
      !Array.isArray(data.questions) ||
      data.questions.length === 0
    ) {
      return Response.json({ error: "AI returned incomplete response" }, { status: 500 })
    }

    return Response.json(data satisfies BehavioralPrepResponse)
  } catch (error) {
    console.error("[/api/behavioral-prep]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
