import { test, expect } from "@playwright/test";

test.describe("as anonymous", () => {
  test("landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Haddock/);
  });

  test("can not see admin page", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.locator("body")).toContainText("Unauthorized");
  });
});

test.describe("as admin", () => {
  const authFile = "playwright/.auth/admin.json";
  test.use({ storageState: authFile });

  test("is logged in", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "gravatar" })).toBeVisible();
  });

  test("can see admin page", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.locator("h1")).toContainText("Admin");
  });
});
