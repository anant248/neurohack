import { type NextRequest } from "next/server"
import { z } from "zod"

const RequestSchema = z.object({
  url: z.string().url(),
})

/** Keywords that indicate a line/paragraph is job-relevant */
const JOB_SECTION_RE =
  /\b(responsibilit|requirement|qualification|about the role|what you('ll| will) do|what we('re| are) looking|nice to have|preferred|experience|skill|benefit|compensation|salary|apply|position|team|mission|culture|about us|who you are|you will|you('ll| have)|join us|description|overview)\b/i

/**
 * Extracts job-relevant text from raw HTML.
 * Strategy:
 *  1. Strip scripts, styles, nav, header, footer, aside
 *  2. Prefer <main> or <article> content if present
 *  3. Convert HTML to plain text
 *  4. If result is still long, keep only paragraphs that contain job keywords
 */
function extractJobText(html: string): string {
  // 1. Remove entirely irrelevant blocks
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // nav / header / footer / aside don't nest themselves so non-greedy regex is fine
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "")

  // 2. Prefer the main content area over the whole document
  const mainMatch = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(cleaned)
  const articleMatch = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(cleaned)
  const coreHtml = mainMatch?.[1] ?? articleMatch?.[1] ?? cleaned

  // 3. HTML → plain text
  const text = coreHtml
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr|td)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (text.length <= 8000) return text

  // 4. Still too long — keep only paragraphs that look job-related
  const paragraphs = text.split(/\n\n+/)
  const relevant = paragraphs.filter(p => p.trim().length > 20 && JOB_SECTION_RE.test(p))
  const filtered = relevant.join("\n\n")

  if (filtered.length >= 500) {
    return filtered.length > 8000 ? filtered.slice(0, 8000) + "\n[truncated]" : filtered
  }

  // Last resort: first 8 000 chars of the full extracted text
  return text.slice(0, 8000) + "\n[truncated]"
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
    const text = extractJobText(html)

    return Response.json({ text })
  } catch (err) {
    console.error("[/api/fetch-jd]", err)
    return Response.json({ error: "Failed to fetch job description URL" }, { status: 500 })
  }
}
