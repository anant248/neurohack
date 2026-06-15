import { test, expect } from "@playwright/test"

test.describe("Auth page", () => {
  test.beforeEach(async ({ page }) => {
    // Stub Supabase auth endpoints so no real network calls are made
    await page.route("**/auth/v1/**", route =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) }),
    )
    await page.goto("/auth")
  })

  test("/auth route is accessible (200)", async ({ page }) => {
    const response = await page.goto("/auth")
    expect(response?.status()).toBe(200)
  })

  test("shows Interprep branding", async ({ page }) => {
    await expect(page.getByText("Interprep")).toBeVisible()
  })

  test("shows Login and Sign Up tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: /log\s*in/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /sign\s*up/i })).toBeVisible()
  })

  test("Sign Up tab shows Full Name field", async ({ page }) => {
    await page.getByRole("button", { name: /sign\s*up/i }).click()
    await expect(page.getByPlaceholder(/your full name/i)).toBeVisible()
  })

  test("Sign Up tab shows email and password fields", async ({ page }) => {
    await page.getByRole("button", { name: /sign\s*up/i }).click()
    // email
    await expect(page.getByPlaceholder(/your@email\.com/i)).toBeVisible()
    // password — at least one password input visible
    const pwInputs = page.locator('input[type="password"]')
    await expect(pwInputs.first()).toBeVisible()
  })

  test("Log In tab shows email and password fields", async ({ page }) => {
    await page.getByRole("button", { name: /log\s*in/i }).click()
    await expect(page.getByPlaceholder(/your@email\.com/i)).toBeVisible()
    const pwInput = page.locator('input[type="password"]')
    await expect(pwInput.first()).toBeVisible()
  })

  test("Log In tab shows Forgot password link", async ({ page }) => {
    await page.getByRole("button", { name: /log\s*in/i }).click()
    await expect(page.getByText(/forgot password/i)).toBeVisible()
  })

  test("fields clear when switching between tabs", async ({ page }) => {
    // Type into Sign Up email
    await page.getByRole("button", { name: /sign\s*up/i }).click()
    const emailInput = page.getByPlaceholder(/your@email\.com/i)
    await emailInput.fill("test@example.com")

    // Switch to Log In
    await page.getByRole("button", { name: /log\s*in/i }).click()
    // The login email input should be empty
    const loginEmail = page.getByPlaceholder(/your@email\.com/i)
    await expect(loginEmail).toHaveValue("")
  })

  test("shows Google and GitHub OAuth buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /github/i })).toBeVisible()
  })

  test("shows skip / continue without sign-in link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /continue without/i })).toBeVisible()
  })

  test("clicking skip navigates away from /auth", async ({ page }) => {
    await page.getByRole("link", { name: /continue without/i }).click()
    await expect(page).not.toHaveURL(/\/auth$/)
  })

  test("Forgot password link shows the forgot-password view", async ({ page }) => {
    await page.getByRole("button", { name: /log\s*in/i }).click()
    await page.getByText(/forgot password/i).click()
    await expect(page.getByPlaceholder(/your@email\.com/i)).toBeVisible()
    // The submit button text changes
    await expect(page.getByRole("button", { name: /send reset/i })).toBeVisible()
  })

  test("Back link from forgot-password returns to Login tab", async ({ page }) => {
    await page.getByRole("button", { name: /log\s*in/i }).click()
    await page.getByText(/forgot password/i).click()
    await page.getByRole("button", { name: /back to log in/i }).click()
    await expect(page.getByRole("button", { name: /send reset/i })).not.toBeVisible()
    await expect(page.getByRole("button", { name: /log\s*in/i })).toBeVisible()
  })
})

test.describe("Auth page — unauthenticated landing flow", () => {
  test("Sign In button on landing page links to /auth", async ({ page }) => {
    await page.route("/api/leetcode", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ title: "Two Sum", difficulty: "Easy", content: "<p>Test</p>", topicTags: [], date: "2026-06-15" }),
      }),
    )
    await page.goto("/")
    const signInBtn = page.getByRole("link", { name: /sign in/i })
    await expect(signInBtn).toBeVisible()
    await expect(signInBtn).toHaveAttribute("href", "/auth")
  })
})
