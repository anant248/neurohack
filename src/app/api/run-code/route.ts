import { type NextRequest } from "next/server"
import { z } from "zod"
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
  content: z.string(), // LeetCode question HTML — used to extract expected outputs
})

export type RunCodeRequest = z.infer<typeof RequestSchema>

export interface RunCodeResponse {
  results: TestResult[]
}

const PISTON_URL = "https://emkc.org/api/v2/piston/execute"

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
  const harness =
    language === "js"
      ? buildJSHarness(code, funcName, testCases)
      : buildPyHarness(code, funcName, testCases)

  try {
    const pistonRes = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: language === "js" ? "javascript" : "python",
        version: "*",
        files: [{ content: harness }],
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (!pistonRes.ok) {
      throw new Error(`Piston API error: ${pistonRes.status}`)
    }

    const pistonData = (await pistonRes.json()) as {
      run: { stdout: string; stderr: string; code: number }
    }

    const { stdout, stderr } = pistonData.run

    if (!stdout.trim()) {
      // Runtime error or compilation failure
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
      return Response.json(
        { error: "Could not parse execution output." },
        { status: 500 },
      )
    }

    return Response.json({ results } satisfies RunCodeResponse)
  } catch (error) {
    console.error("[/api/run-code]", error)
    const isTimeout =
      error instanceof Error && error.name === "TimeoutError"
    return Response.json(
      {
        error: isTimeout
          ? "Execution timed out (10 s). Check for infinite loops."
          : "Failed to reach the code execution service.",
      },
      { status: 503 },
    )
  }
}
