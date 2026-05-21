import { test, expect } from "@playwright/test"

test.describe("Practice page", () => {
  test.beforeEach(async ({ page }) => {
    // Stub the AI feedback API so E2E tests don't hit Gemini
    await page.route("/api/feedback", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ feedback: "Great job maintaining eye contact! Try smiling a bit more." }),
      }),
    )

    await page.goto("/practice")
  })

  test("renders the page title", async ({ page }) => {
    await expect(page.getByText("Let's Ace That Interview.")).toBeVisible()
  })

  test("shows question selector with dropdown", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeVisible()
  })

  test("Start Recording button is disabled without a question", async ({ page }) => {
    const startBtn = page.getByRole("button", { name: /Start Recording/i })
    // Button may not appear until model loads, so wait for it
    await expect(startBtn).toBeVisible({ timeout: 15000 })
    await expect(startBtn).toBeDisabled()
  })

  test("selecting a question enables the Start Recording button", async ({ page }) => {
    const select = page.getByRole("combobox")
    await select.selectOption({ index: 1 })

    // Wait for model to finish loading — button becomes enabled
    const startBtn = page.getByRole("button", { name: /Start Recording/i })
    await expect(startBtn).toBeEnabled({ timeout: 30000 })
  })

  test("Random Question button selects a question", async ({ page }) => {
    await page.getByRole("button", { name: /Random Question/i }).click()
    const select = page.getByRole("combobox")
    const value = await select.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test("/facelandmarker redirects to /practice", async ({ page }) => {
    await page.goto("/facelandmarker")
    await expect(page).toHaveURL(/\/practice/)
  })
})
