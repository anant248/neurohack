import { test, expect } from "@playwright/test"

test.describe("Coffee Chats page", () => {
  test.beforeEach(async ({ page }) => {
    // Stub API so tests don't hit Supabase
    await page.route("/api/coffee-chats", route => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ chats: [] }) })
      }
      return route.continue()
    })
    // Clear localStorage before each test for isolation
    await page.goto("/coffee-chats")
    await page.evaluate(() => localStorage.removeItem("interprep-coffee-chats"))
    await page.reload()
  })

  test("renders the Interprep logo and page heading", async ({ page }) => {
    await expect(page.locator("header").getByText("Interprep")).toBeVisible()
    await expect(page.getByText("Coffee Chats")).toBeVisible()
  })

  test("shows New button in sidebar", async ({ page }) => {
    await expect(page.getByRole("button", { name: /New/i })).toBeVisible()
  })

  test("shows empty state when no chat is selected", async ({ page }) => {
    await expect(page.getByText("Select or create a coffee chat")).toBeVisible()
  })

  test("creates a new chat and shows it in sidebar", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()

    // Editor should appear with person name input
    await expect(page.locator(".chat-person-input")).toBeVisible()

    // Fill in person's name
    await page.locator(".chat-person-input").fill("Jane Smith")

    // Chat should appear in sidebar after debounce
    await expect(page.locator(".chat-list-item")).toContainText("Jane Smith", { timeout: 1500 })
  })

  test("adds company and date which appear in sidebar", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()

    await page.locator(".chat-person-input").fill("Bob Lee")
    await page.locator(".chat-meta-input").first().fill("Google")
    await page.locator('input[type="date"]').fill("2026-06-20")

    await expect(page.locator(".chat-list-meta")).toContainText("Google", { timeout: 1500 })
  })

  test("adds a question from the suggested dropdown", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()

    const dropdown = page.locator(".suggested-select")
    await expect(dropdown).toBeVisible()

    // Select the first non-placeholder option
    const options = await dropdown.locator("option").all()
    const firstSuggested = await options[1].getAttribute("value")
    if (firstSuggested) {
      await dropdown.selectOption(firstSuggested)
      await page.getByRole("button", { name: "Add" }).first().click()
      await expect(page.locator(".question-text").first()).toContainText(firstSuggested)
    }
  })

  test("adds a custom question via text input", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()

    const customInput = page.locator(".custom-question-input")
    await customInput.fill("What does your team culture look like?")
    await customInput.press("Enter")

    await expect(page.locator(".question-text").first()).toContainText("What does your team culture look like?")
  })

  test("deletes a question", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()

    // Add a custom question
    const customInput = page.locator(".custom-question-input")
    await customInput.fill("A question to delete")
    await customInput.press("Enter")
    await expect(page.locator(".question-row")).toHaveCount(1)

    // Delete it
    await page.locator(".question-delete-btn").first().click()
    await expect(page.locator(".question-row")).toHaveCount(0)
  })

  test("opens question notes editor on toggle", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()

    const customInput = page.locator(".custom-question-input")
    await customInput.fill("Expandable question")
    await customInput.press("Enter")

    // Click toggle to open
    await page.locator(".question-toggle-btn").first().click()
    await expect(page.locator(".rich-editor")).toBeVisible()
    await expect(page.locator(".rich-toolbar")).toBeVisible()
  })

  test("imports questions from another chat (text only, no notes)", async ({ page }) => {
    // Create first chat with a question
    await page.getByRole("button", { name: /New/i }).click()
    await page.locator(".chat-person-input").fill("Source Person")

    const customInput = page.locator(".custom-question-input")
    await customInput.fill("Imported question")
    await customInput.press("Enter")
    await expect(page.locator(".question-row")).toHaveCount(1)

    // Create second chat
    await page.getByRole("button", { name: /New/i }).click()
    await page.locator(".chat-person-input").fill("Target Person")

    // Import button should appear since first chat has questions
    await expect(page.locator(".import-questions-btn")).toBeVisible({ timeout: 1000 })
    await page.locator(".import-questions-btn").click()

    // Click the source chat
    await page.locator(".import-chat-btn").first().click()

    // Imported question should be visible
    await expect(page.locator(".question-text").first()).toContainText("Imported question")
  })

  test("deletes a chat via confirm flow", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()
    await page.locator(".chat-person-input").fill("Deletable Chat")
    await expect(page.locator(".chat-list-item")).toContainText("Deletable Chat", { timeout: 1500 })

    // Trigger delete confirm
    await page.locator(".chat-delete-btn").click()
    await expect(page.getByRole("button", { name: "Yes, delete" })).toBeVisible()

    // Confirm delete
    await page.getByRole("button", { name: "Yes, delete" }).click()

    // Empty state should return
    await expect(page.getByText("Select or create a coffee chat")).toBeVisible()
    await expect(page.locator(".chat-list-item")).toHaveCount(0)
  })

  test("cancels delete when clicking Keep it", async ({ page }) => {
    await page.getByRole("button", { name: /New/i }).click()
    await page.locator(".chat-person-input").fill("Kept Chat")

    await page.locator(".chat-delete-btn").click()
    await page.getByRole("button", { name: "Keep it" }).click()

    // Editor still open, list item still present
    await expect(page.locator(".chat-person-input")).toBeVisible()
  })

  test("/coffee-chats route is accessible", async ({ page }) => {
    const response = await page.goto("/coffee-chats")
    expect(response?.status()).toBe(200)
  })
})

test.describe("Landing page — Coffee Chats card", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/leetcode", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ title: "Two Sum", difficulty: "Easy", content: "<p>Test</p>", topicTags: [], date: "2026-06-15" }),
      }),
    )
    await page.goto("/")
  })

  test("shows Coffee Chats card on landing", async ({ page }) => {
    await expect(page.getByTestId("coffee-chats-card")).toBeVisible()
    await expect(page.getByTestId("coffee-chats-card")).toContainText("Coffee Chats")
  })

  test("Coffee Chats card links to /coffee-chats", async ({ page }) => {
    await expect(page.getByTestId("coffee-chats-card")).toHaveAttribute("href", "/coffee-chats")
  })

  test("clicking Coffee Chats card navigates to /coffee-chats", async ({ page }) => {
    await page.getByTestId("coffee-chats-card").click()
    await expect(page).toHaveURL(/\/coffee-chats/)
  })
})
