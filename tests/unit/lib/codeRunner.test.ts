import { describe, it, expect } from "vitest"
import {
  generateStarterCode,
  parseTestCases,
  buildJSHarness,
  buildPyHarness,
  buildPyHarnessClient,
  getFuncName,
} from "@/lib/codeRunner"

const TWO_SUM_META = JSON.stringify({
  name: "twoSum",
  params: [
    { name: "nums", type: "integer[]" },
    { name: "target", type: "integer" },
  ],
  return: { type: "integer[]" },
})

const TWO_SUM_HTML = `<pre>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]</pre><pre>Input: nums = [3,2,4], target = 6\nOutput: [1,2]</pre>`

describe("generateStarterCode", () => {
  it("generates JavaScript JSDoc starter for twoSum", () => {
    const code = generateStarterCode(TWO_SUM_META, "js")
    expect(code).toContain("var twoSum = function(nums, target)")
    expect(code).toContain("@param {number[]} nums")
    expect(code).toContain("@return {number[]}")
  })

  it("generates Python typed starter for twoSum", () => {
    const code = generateStarterCode(TWO_SUM_META, "py")
    expect(code).toContain("def twoSum")
    expect(code).toContain("List[int]")
    expect(code).toContain("-> List[int]")
  })

  it("falls back gracefully for invalid metaData", () => {
    const js = generateStarterCode("not json", "js")
    expect(js).toContain("function")
    const py = generateStarterCode("not json", "py")
    expect(py).toContain("def ")
  })
})

describe("parseTestCases", () => {
  it("parses two test cases for twoSum", () => {
    const cases = parseTestCases("[2,7,11,15]\n9\n[3,2,4]\n6", TWO_SUM_META, TWO_SUM_HTML)
    expect(cases).toHaveLength(2)
    expect(cases[0].inputs).toEqual([[2, 7, 11, 15], 9])
    expect(cases[0].expected).toEqual([0, 1])
    expect(cases[1].inputs).toEqual([[3, 2, 4], 6])
    expect(cases[1].expected).toEqual([1, 2])
  })

  it("returns empty array for invalid metaData", () => {
    expect(parseTestCases("1\n2", "bad json", TWO_SUM_HTML)).toEqual([])
  })

  it("limits results to min(input groups, expected outputs)", () => {
    // 3 input groups but only 1 expected output in HTML
    const html = "<pre>Output: [0,1]</pre>"
    const cases = parseTestCases("[2,7,11,15]\n9\n[3,2,4]\n6\n[3,3]\n6", TWO_SUM_META, html)
    expect(cases).toHaveLength(1)
  })

  it("handles string inputs (e.g. lengthOfLongestSubstring)", () => {
    const meta = JSON.stringify({
      name: "lengthOfLongestSubstring",
      params: [{ name: "s", type: "string" }],
      return: { type: "integer" },
    })
    const html = "<pre>Output: 3</pre>"
    const cases = parseTestCases('"abcabcbb"', meta, html)
    expect(cases).toHaveLength(1)
    expect(cases[0].inputs[0]).toBe("abcabcbb")
    expect(cases[0].expected).toBe(3)
  })
})

describe("buildJSHarness", () => {
  it("embeds the user code", () => {
    const harness = buildJSHarness("function twoSum(a,b){}", "twoSum", [])
    expect(harness).toContain("function twoSum(a,b){}")
  })

  it("calls the correct function name", () => {
    const harness = buildJSHarness("", "twoSum", [
      { inputs: [[1, 2], 3], expected: [0, 1] },
    ])
    expect(harness).toContain("twoSum(...tc.inputs)")
  })
})

describe("buildPyHarness", () => {
  it("embeds the user code", () => {
    const harness = buildPyHarness("def twoSum(a,b): pass", "twoSum", [])
    expect(harness).toContain("def twoSum(a,b): pass")
  })

  it("calls the correct function name", () => {
    const harness = buildPyHarness("", "twoSum", [{ inputs: [[1, 2], 3], expected: [0, 1] }])
    expect(harness).toContain("twoSum(*tc[\"inputs\"])")
  })
})

describe("buildPyHarnessClient", () => {
  it("embeds the user code", () => {
    const harness = buildPyHarnessClient("def twoSum(a,b): pass", "twoSum", [])
    expect(harness).toContain("def twoSum(a,b): pass")
  })

  it("ends with bare expression (no print) so Pyodide can capture the return value", () => {
    const harness = buildPyHarnessClient("", "twoSum", [{ inputs: [[1, 2], 3], expected: [0, 1] }])
    const trimmed = harness.trimEnd()
    expect(trimmed.endsWith("__json.dumps(__results)")).toBe(true)
    expect(trimmed).not.toMatch(/print\s*\(/)
  })
})

describe("getFuncName", () => {
  it("extracts name from valid metaData", () => {
    expect(getFuncName(TWO_SUM_META)).toBe("twoSum")
  })

  it("returns 'solution' for invalid metaData", () => {
    expect(getFuncName("bad")).toBe("solution")
  })
})
