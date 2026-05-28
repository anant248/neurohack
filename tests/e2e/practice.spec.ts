import { test, expect, type Page } from "@playwright/test"

const MOCK_PREP_RESPONSE = {
  companyName: "Test Corp",
  role: "Software Engineer",
  companyBlurb: "Test Corp builds developer tools used by millions of engineers worldwide.",
  companyLink: "https://testcorp.example.com",
  questions: [
    {
      text: "Tell me about yourself.",
      category: "General",
      starHint: "Cover your background (S), your role (T), key actions (A), and impact (R).",
    },
    {
      text: "Describe a challenge you overcame.",
      category: "Growth",
      starHint: "Set the context (S/T), explain your steps (A), and the outcome (R).",
    },
  ],
}

/** Fill in resume + JD and click Generate to move past the setup panel. */
async function completeSetup(page: Page) {
  await page.locator("textarea#resume-input").fill("Software engineer with 3 years of experience.")
  await page.locator("textarea:not(#resume-input)").first().fill("Test Corp is hiring a Software Engineer.")
  await page.getByRole("button", { name: /Generate Tailored Questions/i }).click()
  // Wait for the session view — company card heading signals setup is complete
  await expect(page.getByText("Test Corp")).toBeVisible({ timeout: 10000 })
}

test.describe("Practice page", () => {
  test.beforeEach(async ({ page }) => {
    // Stub AI APIs so E2E tests don't hit real services
    await page.route("/api/feedback", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ feedback: "Great job maintaining eye contact! Try smiling a bit more." }),
      }),
    )

    await page.route("/api/behavioral-prep", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PREP_RESPONSE),
      }),
    )

    await page.goto("/practice")
  })

  test("renders the app logo / brand name", async ({ page }) => {
    await expect(page.getByText("Interprep")).toBeVisible()
  })

  test("shows setup panel on first load", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Generate Tailored Questions/i })).toBeVisible()
  })

  test("shows question selector with dropdown after setup", async ({ page }) => {
    await completeSetup(page)
    await expect(page.getByRole("combobox")).toBeVisible()
  })

  test("shows company card with name and link after setup", async ({ page }) => {
    await completeSetup(page)
    await expect(page.getByText("Test Corp")).toBeVisible()
    await expect(page.getByText("Software Engineer")).toBeVisible()
    await expect(page.getByRole("link", { name: /Learn more about Test Corp/i })).toBeVisible()
  })

  test("Start Recording button is disabled without a question", async ({ page }) => {
    await completeSetup(page)
    // Wait for model to finish loading — button text switches from "Loading model…" to "Start Recording"
    const startBtn = page.getByRole("button", { name: /Start Recording/i })
    await expect(startBtn).toBeVisible({ timeout: 30000 })
    await expect(startBtn).toBeDisabled()
  })

  test("selecting a question enables the Start Recording button", async ({ page }) => {
    await completeSetup(page)
    const select = page.getByRole("combobox")
    await select.selectOption({ index: 1 })

    // Wait for model to finish loading — button becomes enabled
    const startBtn = page.getByRole("button", { name: /Start Recording/i })
    await expect(startBtn).toBeEnabled({ timeout: 30000 })
  })

  test("Random button selects a question", async ({ page }) => {
    await completeSetup(page)
    await page.getByRole("button", { name: /Random/i }).click()
    const select = page.getByRole("combobox")
    const value = await select.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test("STAR hint is shown after selecting a question", async ({ page }) => {
    await completeSetup(page)
    const select = page.getByRole("combobox")
    await select.selectOption({ index: 1 })
    await expect(page.getByText("STAR")).toBeVisible()
    await expect(page.getByText("Framework tip")).toBeVisible()
  })

  test("New session button returns to setup panel", async ({ page }) => {
    await completeSetup(page)
    await page.getByRole("button", { name: /New session/i }).click()
    await expect(page.getByRole("button", { name: /Generate Tailored Questions/i })).toBeVisible()
  })

  test("/facelandmarker redirects to /practice", async ({ page }) => {
    await page.goto("/facelandmarker")
    await expect(page).toHaveURL(/\/practice/)
  })
})
