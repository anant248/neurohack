import { type NextRequest } from "next/server"
import { z } from "zod"
import { runInNewContext } from "vm"
import {
  parseTestCases,
  buildJSHarness,
  getFuncName,
  type TestResult,
} from "@/lib/codeRunner"

const RequestSchema = z.object({
  code: z.string().min(1).max(10000),
  language: z.literal("js"),
  exampleTestcases: z.string(),
  metaData: z.string(),
  content: z.string(),
})

export type RunCodeRequest = z.infer<typeof RequestSchema>

export interface RunCodeResponse {
  results: TestResult[]
}

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

  const { code, exampleTestcases, metaData, content } = parsed.data

  const testCases = parseTestCases(exampleTestcases, metaData, content)
  if (testCases.length === 0) {
    return Response.json(
      { error: "Could not parse test cases for this problem." },
      { status: 422 },
    )
  }

  const funcName = getFuncName(metaData)
  const harness = buildJSHarness(code, funcName, testCases)
  const { stdout, stderr } = executeJS(harness)

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
