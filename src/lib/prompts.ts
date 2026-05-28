export interface FeedbackPromptParams {
  eyeContactScore: number
  expressionScore: number
  question: string
  previousScores?: Array<{ eyeContactScore: number; expressionScore: number }>
}

/**
 * Builds the Gemini prompt for interview feedback coaching.
 *
 * The question IS included so Gemini can give STAR framework tips specific to
 * the question type. However, the prompt explicitly forbids inferring what the
 * candidate said — there is no audio, so verbal content evaluation is impossible.
 *
 * Output is structured into three labeled sections that ResultsCard can parse
 * and render individually.
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

  const leadPositive = eyeContactScore >= 60 || expressionScore >= 60

  return `You are an interview coach. CRITICAL: You have NO audio. You cannot hear the candidate's answer and must NOT infer, assume, or comment on what they said. You saw only face-tracking data.

Question the candidate practised (for STAR tip context only — do NOT evaluate their answer):
"${question}"

Face-tracking metrics:
- Eye Contact: ${eyeContactScore}% (how consistently they looked at the camera)
- Positive Expression: ${expressionScore}% (warm, engaged facial expressions)
${progressContext}
Write exactly three sections using these exact headings. ≤2 sentences per section.

**Visual Presence:**
${leadPositive ? "Start with a genuine strength based on the scores, then give the key improvement." : "Be encouraging about their effort based on the scores, then give the most impactful fix."} Discuss ONLY eye contact and/or facial expression.

**STAR Tip:**
Give one actionable tip for structuring an answer to this specific question type using the STAR framework. Do NOT comment on what the candidate actually said.

**Key Focus:**
One single concrete technique to practise before their next attempt.`
}
