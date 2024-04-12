import { test, expect, Page } from "@playwright/test";

test("landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Haddock/);
});


test.describe("as admin", () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test("is logged in", async ({page}) => {
    await page.goto("/");

    await expect(page.getByRole('button', { name: 'gravatar' })).toBeVisible();
  });
});
