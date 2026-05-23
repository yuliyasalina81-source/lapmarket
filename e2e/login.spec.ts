import { test, expect } from "@playwright/test";

test("credentials login redirects to profile", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("maria@example.com");
  await page.getByLabel("Пароль").fill("lapmarket123");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/profile**", { timeout: 15000 });
  await expect(page).toHaveURL(/\/profile/);
});
