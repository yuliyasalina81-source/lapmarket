import { test, expect } from "@playwright/test";

test("services catalog page loads", async ({ page }) => {
  await page.goto("/services");
  await expect(page.getByRole("heading", { name: /Ветеринары и грумеры/i })).toBeVisible();
});

test("login redirects specialist to dashboard", async ({ page }) => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Requires Supabase and seeded specialist account"
  );
  await page.goto("/login");
  await page.getByLabel("Email").fill("vet@example.com");
  await page.getByLabel("Пароль").fill("lapmarket123");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard/specialist**", { timeout: 15000 });
});
