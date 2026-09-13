import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("home shows brand and primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ManoYug AI" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Talk to ManoYug AI/i })).toBeVisible();
  });

  test("register page renders required fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("student companion page loads", async ({ page }) => {
    await page.goto("/student/chat");
    await expect(page.getByRole("heading", { name: "AI Companion" })).toBeVisible();
  });

  test("help lists verified Tele-MANAS resources", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByText("Tele-MANAS")).toBeVisible();
    await expect(page.getByText("14416")).toBeVisible();
  });
});
