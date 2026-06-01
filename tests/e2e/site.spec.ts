import { expect, test } from "@playwright/test";

test("serves the home page", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Franciscan Community");
  await expect(
    page.getByRole("heading", { name: "Peace and good." })
  ).toBeVisible();
});

test("serves the custom 404 page for missing routes", async ({ page }) => {
  const response = await page.goto("/missing-page");

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found | Franciscan Community");
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});
