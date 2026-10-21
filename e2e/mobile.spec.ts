import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectFooterUncovered } from "./footer-helpers";

test("mobile menu opens, navigates and closes", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Site menu" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await menu.getByRole("button", { name: "Services" }).click();
  await menu.getByRole("link", { name: "Fire Alarm Systems" }).click();
  await expect(page).toHaveURL(/\/services\/fire-alarm-systems$/);
  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
});

test("no horizontal overflow on key pages", async ({ page }) => {
  for (const route of ["/", "/services/fire-protection-systems", "/equipment", "/request-a-quote", "/contact"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(0);
  }
});

test("bottom action bar offers call and quote shortcuts", async ({ page }) => {
  await page.goto("/");
  const bar = page.getByRole("navigation", { name: "Quick contact" });
  await expect(bar.getByRole("link", { name: "Call" })).toHaveAttribute("href", "tel:+918522021566");
  await expect(bar.getByRole("link", { name: "Get a Quote" })).toHaveAttribute("href", "/request-a-quote");
});

test("chat panel fits the mobile viewport and is usable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Ask/ }).click();
  const dialog = page.getByRole("dialog", { name: "Safe Bharat Assistant" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  const vp = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
  await dialog.getByRole("button", { name: "Contact the team" }).click();
  await expect(dialog.getByText("Talk to the Safe Bharat team")).toBeVisible();
});

test("mobile home page has no serious axe violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1200);
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => v.id)).toEqual([]);
});

for (const route of ["/", "/contact"]) {
  test(`chat launcher and quick-contact bar do not cover footer links or notices on ${route}`, async ({ page }) => {
    await expectFooterUncovered(page, route);
  });
}
