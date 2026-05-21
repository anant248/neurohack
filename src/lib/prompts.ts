export interface FeedbackPromptParams {
  eyeContactScore: number
  expressionScore: number
  question: string
  previousScores?: Array<{ eyeContactScore: number; expressionScore: number }>
}

/**
 * Builds the Gemini prompt for interview feedback coaching.
 * Feedback is based ONLY on visual face-tracking data — the AI cannot
 * hear the candidate and must not infer or comment on verbal content.
 */
export function buildFeedbackPrompt(params: FeedbackPromptParams): string {
  const { eyeContactScore, expressionScore, previousScores } = params
  // question is intentionally excluded from the prompt — including it caused
  // Gemini to comment on the candidate's answer content, which it cannot hear.

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

  return `You are an interview coach reviewing face-tracking data only. You have no audio — you cannot assess what the candidate said. Give feedback on visual presence exclusively.

Face-tracking metrics:
- Eye Contact: ${eyeContactScore}% (how consistently they looked at the camera lens)
- Positive Expression: ${expressionScore}% (warm, engaged facial expressions like smiling)
${progressContext}
Write exactly 2–3 sentences. Rules (strict):
1. Discuss ONLY eye contact and/or facial expression — nothing else
2. Do NOT reference the question topic, their answer, or what they may have said
3. Include one specific, concrete technique (e.g., "focus on the camera dot, not your reflection")
4. ${leadPositive ? "Start with a genuine strength, then give the key improvement." : "Be encouraging about their effort, then give the most impactful fix."}`
}
