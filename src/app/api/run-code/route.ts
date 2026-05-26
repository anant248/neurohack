import { type NextRequest } from "next/server"
import { z } from "zod"
import { runInNewContext } from "vm"
import {
  parseTestCases,
  buildJSHarness,
  buildPyHarness,
  getFuncName,
  type TestResult,
} from "@/lib/codeRunner"

const RequestSchema = z.object({
  code: z.string().min(1).max(10000),
  language: z.enum(["js", "py"]),
  exampleTestcases: z.string(),
  metaData: z.string(),
  content: z.string(),
})

export type RunCodeRequest = z.infer<typeof RequestSchema>

export interface RunCodeResponse {
  results: TestResult[]
}

const PISTON_URL = "https://emkc.org/api/v2/piston/execute"

// ── JavaScript execution via Node.js vm (no external service) ───────────────

function executeJS(harness: string): { stdout: string; stderr: string } {
  const logs: string[] = []
  const ctx = {
    console: {
      log: (...args: unknown[]) =>
        logs.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")),
      error: (...args: unknown[]) =>
        logs.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")),
    },
    JSON,
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Set,
    Map,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
  }
  try {
    runInNewContext(harness, ctx, { timeout: 5000 })
    return { stdout: logs.join("\n"), stderr: "" }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { stdout: "", stderr: msg }
  }
}

// ── Python execution via Piston API ─────────────────────────────────────────

async function executePython(
  harness: string,
): Promise<{ stdout: string; stderr: string } | null> {
  try {
    const res = await fetch(PISTON_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "interprep/1.0",
      },
      body: JSON.stringify({
        language: "python",
        version: "*",
        files: [{ content: harness }],
      }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { run: { stdout: string; stderr: string } }
    return { stdout: data.run.stdout ?? "", stderr: data.run.stderr ?? "" }
  } catch {
    return null
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

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

  const { code, language, exampleTestcases, metaData, content } = parsed.data

  const testCases = parseTestCases(exampleTestcases, metaData, content)
  if (testCases.length === 0) {
    return Response.json(
      { error: "Could not parse test cases for this problem." },
      { status: 422 },
    )
  }

  const funcName = getFuncName(metaData)

  let stdout: string
  let stderr: string

  if (language === "js") {
    const harness = buildJSHarness(code, funcName, testCases)
    const result = executeJS(harness)
    stdout = result.stdout
    stderr = result.stderr
  } else {
    const harness = buildPyHarness(code, funcName, testCases)
    const result = await executePython(harness)
    if (result === null) {
      return Response.json(
        {
          error:
            "Python execution service is unavailable. Try switching to JavaScript, or test your Python solution locally with `python solution.py`.",
        },
        { status: 503 },
      )
    }
    stdout = result.stdout
    stderr = result.stderr
  }

  if (!stdout.trim()) {
    const errMsg = stderr?.trim() || "Execution produced no output."
    return Response.json({
      results: testCases.map((tc) => ({
        pass: false,
        actual: errMsg.split("\n")[0] ?? "Runtime error",
        expected: JSON.stringify(tc.expected),
        error: errMsg,
      })),
    } satisfies RunCodeResponse)
  }

  let results: TestResult[]
  try {
    results = JSON.parse(stdout.trim()) as TestResult[]
  } catch {
    return Response.json({ error: "Could not parse execution output." }, { status: 500 })
  }

  return Response.json({ results } satisfies RunCodeResponse)
}
