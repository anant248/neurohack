import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    // Stub the LeetCode API so E2E tests don't hit the real endpoint
    await page.route("/api/leetcode", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          title: "Two Sum",
          difficulty: "Easy",
          content: "<p>Given an array of integers, return indices of the two numbers such that they add up to target.</p>",
          topicTags: ["Array", "Hash Table"],
          date: "2026-05-26",
        }),
      }),
    )
    await page.goto("/")
  })

  test("renders the Interprep logo", async ({ page }) => {
    await expect(page.locator("header").getByText("Interprep")).toBeVisible()
  })

  test("shows the Behavioural card", async ({ page }) => {
    await expect(page.getByTestId("behavioral-card")).toBeVisible()
    await expect(page.getByTestId("behavioral-card")).toContainText("Behavioural")
  })

  test("shows the Technical card", async ({ page }) => {
    await expect(page.getByTestId("technical-card")).toBeVisible()
    await expect(page.getByTestId("technical-card")).toContainText("Technical")
  })

  test("Behavioral Practice card links to /practice", async ({ page }) => {
    const card = page.getByTestId("behavioral-card")
    await expect(card).toHaveAttribute("href", "/practice")
  })

  test("Technical Interview card links to /technical", async ({ page }) => {
    const card = page.getByTestId("technical-card")
    await expect(card).toHaveAttribute("href", "/technical")
  })

  test("clicking Technical Interview navigates to /technical", async ({ page }) => {
    await page.getByTestId("technical-card").click()
    await expect(page).toHaveURL(/\/technical/)
  })

  test("clicking Behavioral Practice navigates to /practice", async ({ page }) => {
    await page.getByTestId("behavioral-card").click()
    await expect(page).toHaveURL(/\/practice/)
  })
})

test.describe("Technical page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/leetcode", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          title: "Two Sum",
          difficulty: "Easy",
          content: "<p>Return indices of two numbers that add up to target.</p>",
          topicTags: ["Array", "Hash Table"],
          date: "2026-05-26",
        }),
      }),
    )
    await page.route("/api/code-review", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          review: "**Correctness**: Incorrect — returns empty array.\n**Complexity**: O(1) time.\n**Style**: Use a hash map for O(n) lookup.",
        }),
      }),
    )
    await page.goto("/technical")
  })

  test("renders the Interprep logo", async ({ page }) => {
    await expect(page.locator("header").getByText("Interprep")).toBeVisible()
  })

  test("shows the question title", async ({ page }) => {
    await expect(page.getByTestId("question-title")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("question-title")).toContainText("Two Sum")
  })

  test("shows the difficulty badge", async ({ page }) => {
    await expect(page.getByText("Easy")).toBeVisible({ timeout: 10000 })
  })

  test("shows topic tags", async ({ page }) => {
    await expect(page.getByText("Array")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Hash Table")).toBeVisible({ timeout: 10000 })
  })

  test("Interprep logo navigates to /", async ({ page }) => {
    await page.locator("header").getByRole("link", { name: "Interprep" }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test("Get AI Feedback button is visible", async ({ page }) => {
    await expect(page.getByTestId("review-btn")).toBeVisible({ timeout: 10000 })
  })

  test("clicking Get AI Feedback shows the review panel", async ({ page }) => {
    await page.getByTestId("review-btn").click()
    await expect(page.getByTestId("review-panel")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("review-panel")).toContainText("Correctness")
  })
})
