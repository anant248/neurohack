import { type NextRequest } from "next/server"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"

const RequestSchema = z.object({
  personName: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  role: z.string().max(200).default(""),
  questions: z.array(
    z.object({
      text: z.string().max(1000),
      notes: z.string().max(50000).default(""),
    }),
  ).max(50),
})

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.format() }, { status: 400 })
  }

  const { personName, company, role, questions } = parsed.data

  const questionsWithNotes = questions.filter(q => stripHtml(q.notes).length > 10)
  if (questionsWithNotes.length === 0) {
    return Response.json({
      todos: [],
      message: "Not enough context for meaningful to-dos — add some notes to your questions first.",
    })
  }

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: "AI unavailable" }, { status: 503 })
    }

    const contextLines = questionsWithNotes.map(q => {
      const notes = stripHtml(q.notes)
      return `Q: ${q.text}\nNotes: ${notes}`
    }).join("\n\n")

    const who = [personName, role && `(${role})`, company && `at ${company}`].filter(Boolean).join(" ")

    const prompt = `You are helping a student review notes from a coffee chat with ${who || "a professional"}.

Here are their questions and notes:
${contextLines}

Based on these notes, generate 1–3 SPECIFIC, actionable follow-up to-dos or next steps. Scale the count to the depth of the notes: sparse notes → 1 item, rich notes → up to 3.

Focus on:
- Concrete follow-up actions (e.g., "Send thank-you email referencing [specific topic discussed]")
- Resources, people, or companies mentioned that should be researched
- Specific applications or next steps that came up in conversation

If the notes are too sparse or generic to generate meaningful to-dos, respond with exactly: NOT_ENOUGH_CONTEXT

Otherwise return ONLY a valid JSON array of strings, no markdown, no explanation:
["...", "..."]`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
    })

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    if (raw === "NOT_ENOUGH_CONTEXT") {
      return Response.json({
        todos: [],
        message: "Not enough context for meaningful to-dos — your notes need more detail.",
      })
    }

    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return Response.json({ todos: [], message: "Could not parse AI response." })
    }

    const todos = JSON.parse(jsonMatch[0]) as string[]
    const valid = todos.filter(t => typeof t === "string" && t.trim().length > 0).slice(0, 3)

    return Response.json({ todos: valid })
  } catch (error) {
    console.error("[POST /api/coffee-chats/generate-todos]", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
