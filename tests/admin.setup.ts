import { test as setup, expect } from "@playwright/test";

setup("register as admin", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("link", { name: "New user? Click here to" }).click();
  await page.getByLabel("Email").fill("someone@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password");
  await page.getByLabel("Confirm password").fill("password");
  await page.getByRole("button", { name: "Register" }).click();

  // Wait for /register POST request to complete
  await page.waitForTimeout(500);

  // if this email is already registered then login
  const elem = page.getByText("This email is already registered.");
  const alreadyRegistered = await elem.isVisible();
  if (alreadyRegistered) {
    console.log("Already registered, logging in...");
    await page
      .getByRole("link", { name: "Or login if you already have" })
      .click();
    await page.getByLabel("Email").fill("someone@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password");
    await page.getByRole("button", { name: "Log in" }).click();
  }

  // Check that the user is logged in
  await expect(page.getByAltText("gravatar")).toBeVisible();

  const authFile = "playwright/.auth/admin.json";
  await page.context().storageState({ path: authFile });
});
