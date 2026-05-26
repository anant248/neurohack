export interface LeetCodeQuestion {
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  content: string // HTML
  topicTags: string[]
  date: string
}

const FALLBACK_QUESTIONS: LeetCodeQuestion[] = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    content:
      "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p><p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p><p>You can return the answer in any order.</p><p><strong>Example 1:</strong></p><pre>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9</pre>",
    topicTags: ["Array", "Hash Table"],
    date: new Date().toISOString().split("T")[0],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    content:
      "<p>Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.</p><p><strong>Example 1:</strong></p><pre>Input: s = \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3.</pre>",
    topicTags: ["Hash Table", "String", "Sliding Window"],
    date: new Date().toISOString().split("T")[0],
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    content:
      "<p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return <strong>the median</strong> of the two sorted arrays.</p><p>The overall run time complexity should be <code>O(log (m+n))</code>.</p>",
    topicTags: ["Array", "Binary Search", "Divide and Conquer"],
    date: new Date().toISOString().split("T")[0],
  },
]

const GRAPHQL_QUERY = `{
  activeDailyCodingChallengeQuestion {
    date
    question {
      title
      difficulty
      content
      topicTags { name }
    }
  }
}`

export async function fetchDailyQuestion(): Promise<LeetCodeQuestion> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GRAPHQL_QUERY }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`LeetCode API error: ${res.status}`)

    const json = await res.json()
    const challenge = json?.data?.activeDailyCodingChallengeQuestion

    if (!challenge) throw new Error("No challenge in response")

    const q = challenge.question
    return {
      title: q.title,
      difficulty: q.difficulty as LeetCodeQuestion["difficulty"],
      content: q.content,
      topicTags: (q.topicTags as Array<{ name: string }>).map((t) => t.name),
      date: challenge.date,
    }
  } catch {
    return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)]
  }
}
