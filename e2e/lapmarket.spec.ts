import { test, expect } from "@playwright/test";

test.describe("LapMarket", () => {
  test("landing shows health hub", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/питомца/i);
    await expect(page.getByRole("link", { name: /Паспорт питомца/i })).toBeVisible();
  });

  test("login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("link", { name: /Забыли пароль/i })).toBeVisible();
  });

  test("market page loads", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
