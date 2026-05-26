export interface LeetCodeQuestion {
  title: string
  titleSlug: string
  difficulty: "Easy" | "Medium" | "Hard"
  content: string // HTML
  topicTags: string[]
  date: string
  metaData: string // JSON string: {name, params:[{name,type}], return:{type}}
  exampleTestcases: string // newline-separated example inputs
}

const FALLBACK_QUESTIONS: LeetCodeQuestion[] = [
  {
    title: "Two Sum",
    titleSlug: "two-sum",
    difficulty: "Easy",
    content:
      "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p><p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p><p><strong>Example 1:</strong></p><pre>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9</pre><p><strong>Example 2:</strong></p><pre>Input: nums = [3,2,4], target = 6\nOutput: [1,2]</pre><p><strong>Example 3:</strong></p><pre>Input: nums = [3,3], target = 6\nOutput: [0,1]</pre>",
    topicTags: ["Array", "Hash Table"],
    date: new Date().toISOString().split("T")[0],
    metaData: JSON.stringify({
      name: "twoSum",
      params: [
        { name: "nums", type: "integer[]" },
        { name: "target", type: "integer" },
      ],
      return: { type: "integer[]" },
    }),
    exampleTestcases: "[2,7,11,15]\n9\n[3,2,4]\n6\n[3,3]\n6",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    titleSlug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    content:
      "<p>Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.</p><p><strong>Example 1:</strong></p><pre>Input: s = \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3.</pre><p><strong>Example 2:</strong></p><pre>Input: s = \"bbbbb\"\nOutput: 1\nExplanation: The answer is \"b\", with the length of 1.</pre><p><strong>Example 3:</strong></p><pre>Input: s = \"pwwkew\"\nOutput: 3</pre>",
    topicTags: ["Hash Table", "String", "Sliding Window"],
    date: new Date().toISOString().split("T")[0],
    metaData: JSON.stringify({
      name: "lengthOfLongestSubstring",
      params: [{ name: "s", type: "string" }],
      return: { type: "integer" },
    }),
    exampleTestcases: '"abcabcbb"\n"bbbbb"\n"pwwkew"',
  },
  {
    title: "Median of Two Sorted Arrays",
    titleSlug: "median-of-two-sorted-arrays",
    difficulty: "Hard",
    content:
      "<p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return <strong>the median</strong> of the two sorted arrays.</p><p>The overall run time complexity should be <code>O(log (m+n))</code>.</p><p><strong>Example 1:</strong></p><pre>Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.00000\nExplanation: merged array = [1,2,3] and median is 2.</pre><p><strong>Example 2:</strong></p><pre>Input: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.50000</pre>",
    topicTags: ["Array", "Binary Search", "Divide and Conquer"],
    date: new Date().toISOString().split("T")[0],
    metaData: JSON.stringify({
      name: "findMedianSortedArrays",
      params: [
        { name: "nums1", type: "integer[]" },
        { name: "nums2", type: "integer[]" },
      ],
      return: { type: "double" },
    }),
    exampleTestcases: "[1,3]\n[2]\n[1,2]\n[3,4]",
  },
]

const GRAPHQL_QUERY = `{
  activeDailyCodingChallengeQuestion {
    date
    question {
      title
      titleSlug
      difficulty
      content
      topicTags { name }
      metaData
      exampleTestcases
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
      titleSlug: q.titleSlug,
      difficulty: q.difficulty as LeetCodeQuestion["difficulty"],
      content: q.content,
      topicTags: (q.topicTags as Array<{ name: string }>).map((t) => t.name),
      date: challenge.date,
      metaData: q.metaData ?? "{}",
      exampleTestcases: q.exampleTestcases ?? "",
    }
  } catch {
    return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)]
  }
}
