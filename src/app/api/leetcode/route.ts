import { NextResponse } from "next/server"
import { fetchDailyQuestion } from "@/lib/leetcode"

export async function GET() {
  const question = await fetchDailyQuestion()
  return NextResponse.json(question, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
