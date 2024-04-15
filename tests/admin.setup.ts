import { test as setup, expect } from "@playwright/test";

setup("register as admin", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("link", { name: "New user? Click here to" }).click();
  await page.getByLabel("Email").fill("someone@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password");
  await page.getByLabel("Confirm password").fill("password");
  await page.getByRole("button", { name: "Register" }).click();

  // Check that the user is logged in
  await expect(page.getByRole("button", { name: "gravatar" })).toBeVisible();

  const authFile = "playwright/.auth/admin.json";
  await page.context().storageState({ path: authFile });
});
