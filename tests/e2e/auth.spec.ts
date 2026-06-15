import { test, expect } from "@playwright/test"

test.describe("Auth page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth")
  })

  test("/auth route is accessible (200)", async ({ page }) => {
    const response = await page.goto("/auth")
    expect(response?.status()).toBe(200)
  })

  test("shows Interprep branding", async ({ page }) => {
    await expect(page.getByText("Interprep")).toBeVisible()
  })

  // Tabs have role="tab" (not role="button") — use getByRole("tab")
  test("shows Login and Sign Up tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Log In" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Sign Up" })).toBeVisible()
  })

  test("Sign Up tab shows Full Name field", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign Up" }).click()
    // Signup panel is first .auth-form div; placeholder is "Enter your full name"
    await expect(
      page.locator(".auth-form").first().getByPlaceholder("Enter your full name")
    ).toBeVisible()
  })

  test("Sign Up tab shows email and password fields", async ({ page }) => {
    await page.getByRole("tab", { name: "Sign Up" }).click()
    const signupPanel = page.locator(".auth-form").first()
    // Both use "Enter your email"; password uses "Create a password"
    await expect(signupPanel.locator('input[type="email"]')).toBeVisible()
    await expect(signupPanel.locator('input[type="password"]')).toBeVisible()
  })

  test("Log In tab shows email and password fields", async ({ page }) => {
    // Log In is the default active tab — login panel is second .auth-form div
    const loginPanel = page.locator(".auth-form").nth(1)
    await expect(loginPanel.locator('input[type="email"]')).toBeVisible()
    await expect(loginPanel.locator('input[type="password"]')).toBeVisible()
  })

  test("Log In tab shows Forgot password link", async ({ page }) => {
    // Button text is "Forgot your password?" — regex must span "your"
    await expect(
      page.getByRole("button", { name: /forgot.*password/i })
    ).toBeVisible()
  })

  test("fields clear when switching between tabs", async ({ page }) => {
    // Default is Log In — fill email in the login panel
    const loginPanel = page.locator(".auth-form").nth(1)
    await loginPanel.locator('input[type="email"]').fill("test@example.com")

    // Switch to Sign Up → handleTabSwitch clears all fields
    await page.getByRole("tab", { name: "Sign Up" }).click()

    // Signup panel email must now be empty (shared state was cleared)
    const signupPanel = page.locator(".auth-form").first()
    await expect(signupPanel.locator('input[type="email"]')).toHaveValue("")
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
    // Click the forgot password button (text: "Forgot your password?")
    await page.getByRole("button", { name: /forgot.*password/i }).click()

    // View switches to forgot — button changes to "Send Reset Link"
    await expect(page.getByRole("button", { name: "Send Reset Link" })).toBeVisible()
    // Email input shows (placeholder changes in forgot view)
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test("Back link from forgot-password returns to Login tab", async ({ page }) => {
    await page.getByRole("button", { name: /forgot.*password/i }).click()
    // Button text is "← Back to Log In"
    await page.getByRole("button", { name: /back to log in/i }).click()

    // Back to main auth view — tabs are visible again
    await expect(page.getByRole("tab", { name: "Log In" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Sign Up" })).toBeVisible()
    // "Send Reset Link" is gone
    await expect(page.getByRole("button", { name: "Send Reset Link" })).not.toBeVisible()
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
