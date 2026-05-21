export interface FeedbackPromptParams {
  eyeContactScore: number
  expressionScore: number
  question: string
  previousScores?: Array<{ eyeContactScore: number; expressionScore: number }>
}

/**
 * Builds the Gemini prompt for interview feedback coaching.
 * Pure function — no side effects, fully testable.
 */
export function buildFeedbackPrompt(params: FeedbackPromptParams): string {
  const { eyeContactScore, expressionScore, question, previousScores } = params

  let progressContext = ""
  if (previousScores && previousScores.length > 0) {
    const last = previousScores[previousScores.length - 1]
    const eyeDelta = eyeContactScore - last.eyeContactScore
    const exprDelta = expressionScore - last.expressionScore
    const eyeSign = eyeDelta >= 0 ? "+" : ""
    const exprSign = exprDelta >= 0 ? "+" : ""
    progressContext = `\nProgress since last attempt: Eye Contact ${eyeSign}${eyeDelta}%, Expression ${exprSign}${exprDelta}%.`
  }

  return `You are an expert interview coach. The candidate just practiced answering this behavioral interview question:

"${question}"

Performance metrics (internal — do NOT quote these numbers back):
- Eye Contact: ${eyeContactScore}% (camera gaze consistency)
- Expression: ${expressionScore}% (positive facial engagement)
${progressContext}
Give concise, actionable coaching in 2-3 sentences. Cover:
1. One thing they did well (skip if both scores < 40)
2. The single highest-impact improvement
3. One concrete technique tied to the specific question (if helpful)

Be encouraging but direct. Do not reference scores or percentages. Start with "You " or a positive opener.`
}
