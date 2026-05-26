export interface CodeReviewPromptParams {
  code: string
  language: "js" | "py"
  problemTitle: string
  problemContent: string
}

const LANG_LABEL: Record<CodeReviewPromptParams["language"], string> = {
  js: "JavaScript",
  py: "Python",
}

export function buildCodeReviewPrompt(params: CodeReviewPromptParams): string {
  const { code, language, problemTitle, problemContent } = params
  const lang = LANG_LABEL[language]

  return `You are a senior software engineer reviewing a candidate's coding interview solution. Be direct, specific, and constructive.

Problem: ${problemTitle}
Description (HTML stripped):
${problemContent.replace(/<[^>]*>/g, "").trim()}

Candidate's ${lang} solution:
\`\`\`${language}
${code.trim()}
\`\`\`

Write a concise review covering exactly these three sections (use these exact headings):

**Correctness**
Does the approach solve the problem? If not, identify the specific flaw. If yes, confirm it.

**Complexity**
State the time and space complexity with Big-O notation and explain why in one sentence each.

**Style & Improvements**
One or two concrete suggestions to improve readability, edge-case handling, or idiomatic ${lang} usage.

Keep the entire review under 200 words. Be specific — reference the actual variable names and logic from the candidate's code.`
}
