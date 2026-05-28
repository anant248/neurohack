import { type NextRequest } from "next/server"
import { z } from "zod"

const RequestSchema = z.object({
  url: z.string().url(),
})

function htmlToText(html: string): string {
  // Remove script and style blocks entirely
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    // Replace block elements with newlines
    .replace(/<\/(p|div|li|h[1-6]|section|article|header|footer|main|br)>/gi, "\n")
    // Strip all remaining tags
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse excess whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  return text
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

  const { url } = parsed.data

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return Response.json(
        { error: `Failed to fetch URL: HTTP ${res.status}` },
        { status: 422 },
      )
    }

    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return Response.json(
        { error: "URL does not appear to be a text/HTML page" },
        { status: 422 },
      )
    }

    const html = await res.text()
    const text = htmlToText(html)

    // Cap at ~8 000 chars to keep within Gemini context
    const truncated = text.length > 8000 ? text.slice(0, 8000) + "\n[truncated]" : text

    return Response.json({ text: truncated })
  } catch (err) {
    console.error("[/api/fetch-jd]", err)
    return Response.json({ error: "Failed to fetch job description URL" }, { status: 500 })
  }
}
