export interface TestCase {
  inputs: unknown[]
  expected: unknown
}

export interface TestResult {
  pass: boolean
  actual: string
  expected: string
  error?: string
}

interface MetaParam {
  name: string
  type: string
}

interface MetaData {
  name: string
  params: MetaParam[]
  return: { type: string }
}

// ── Type maps ────────────────────────────────────────────────────────────────

const JS_TYPE: Record<string, string> = {
  integer: "number",
  "integer[]": "number[]",
  "integer[][]": "number[][]",
  long: "number",
  double: "number",
  float: "number",
  string: "string",
  "string[]": "string[]",
  boolean: "boolean",
  void: "void",
  character: "character",
  "character[][]": "character[][]",
  ListNode: "ListNode",
  TreeNode: "TreeNode",
}

const PY_TYPE: Record<string, string> = {
  integer: "int",
  "integer[]": "List[int]",
  "integer[][]": "List[List[int]]",
  long: "int",
  double: "float",
  float: "float",
  string: "str",
  "string[]": "List[str]",
  boolean: "bool",
  void: "None",
  character: "str",
  "character[][]": "List[List[str]]",
  ListNode: "Optional[ListNode]",
  TreeNode: "Optional[TreeNode]",
}

// ── Starter code generation ──────────────────────────────────────────────────

export function generateStarterCode(metaDataStr: string, language: "js" | "py"): string {
  let meta: MetaData
  try {
    meta = JSON.parse(metaDataStr) as MetaData
  } catch {
    return language === "js"
      ? "var solution = function() {\n    \n};\n"
      : "def solution():\n    pass\n"
  }

  const { name, params } = meta
  const retType = meta.return?.type ?? "void"

  if (language === "js") {
    const jsdocParams = params
      .map((p) => ` * @param {${JS_TYPE[p.type] ?? p.type}} ${p.name}`)
      .join("\n")
    const jsdocReturn = ` * @return {${JS_TYPE[retType] ?? retType}}`
    const paramList = params.map((p) => p.name).join(", ")
    return `/**\n${jsdocParams}\n${jsdocReturn}\n */\nvar ${name} = function(${paramList}) {\n    \n};\n`
  }

  // Python
  const needsImport =
    Object.values(PY_TYPE).some((v) => v.startsWith("List") || v.startsWith("Optional")) &&
    params.some((p) => PY_TYPE[p.type]?.startsWith("List") || PY_TYPE[p.type]?.startsWith("Optional"))
  const importLine = needsImport ? "from typing import List, Optional\n\n" : ""
  const typedParams = params
    .map((p) => `${p.name}: ${PY_TYPE[p.type] ?? p.type}`)
    .join(", ")
  const retTypePy = PY_TYPE[retType] ?? retType
  return `${importLine}def ${name}(${typedParams}) -> ${retTypePy}:\n    `
}

// ── Test case parsing ────────────────────────────────────────────────────────

function parseExpectedOutputs(contentHtml: string): unknown[] {
  // Replace block-level elements with newlines BEFORE stripping tags so
  // "Output: [0,1]</pre><pre>Input: ..." doesn't merge into one line
  const plain = contentHtml
    .replace(/<\/(pre|p|div|li|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")

  const matches = [...plain.matchAll(/Output:\s*([^\n\r]+)/g)]
  return matches.map((m) => {
    const raw = m[1].trim()
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  })
}

export function parseTestCases(
  exampleTestcases: string,
  metaDataStr: string,
  contentHtml: string,
): TestCase[] {
  let meta: MetaData
  try {
    meta = JSON.parse(metaDataStr) as MetaData
  } catch {
    return []
  }

  const paramCount = meta.params.length
  if (paramCount === 0) return []

  const inputLines = exampleTestcases
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const inputGroups: string[][] = []
  for (let i = 0; i + paramCount <= inputLines.length; i += paramCount) {
    inputGroups.push(inputLines.slice(i, i + paramCount))
  }

  const expectedOutputs = parseExpectedOutputs(contentHtml)

  const count = Math.min(inputGroups.length, expectedOutputs.length)
  return Array.from({ length: count }, (_, i) => ({
    inputs: inputGroups[i].map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return line
      }
    }),
    expected: expectedOutputs[i],
  }))
}

// ── Test harness builders ────────────────────────────────────────────────────

export function buildJSHarness(
  code: string,
  funcName: string,
  testCases: TestCase[],
): string {
  return `${code}

// ── auto-injected test harness ──
(() => {
  const __cases = ${JSON.stringify(testCases)};
  const __results = [];
  for (const tc of __cases) {
    try {
      const __actual = ${funcName}(...tc.inputs);
      const __pass = JSON.stringify(__actual) === JSON.stringify(tc.expected);
      __results.push({ pass: __pass, actual: JSON.stringify(__actual), expected: JSON.stringify(tc.expected) });
    } catch (e) {
      __results.push({ pass: false, actual: 'Error: ' + e.message, expected: JSON.stringify(tc.expected) });
    }
  }
  console.log(JSON.stringify(__results));
})();
`
}

export function buildPyHarness(
  code: string,
  funcName: string,
  testCases: TestCase[],
): string {
  // Embed test cases as a JSON string parsed at runtime to avoid Python literal escaping
  const casesJson = JSON.stringify(testCases).replace(/\\/g, "\\\\").replace(/'/g, "\\'")
  return `import json as __json

${code}

# ── auto-injected test harness ──
__cases = __json.loads('${casesJson}')
__results = []
for tc in __cases:
    try:
        __actual = ${funcName}(*tc["inputs"])
        __expected = tc["expected"]
        __pass = __actual == __expected
        __results.append({"pass": __pass, "actual": str(__actual), "expected": str(__expected)})
    except Exception as e:
        __results.append({"pass": False, "actual": f"Error: {e}", "expected": str(tc["expected"])})
print(__json.dumps(__results))
`
}

export function getFuncName(metaDataStr: string): string {
  try {
    const meta = JSON.parse(metaDataStr) as MetaData
    return meta.name ?? "solution"
  } catch {
    return "solution"
  }
}
