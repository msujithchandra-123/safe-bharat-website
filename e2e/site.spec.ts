import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectFooterUncovered } from "./footer-helpers";

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/fire-extinguishers",
  "/services/fire-protection-systems",
  "/services/fire-alarm-systems",
  "/services/installation-commissioning",
  "/services/amc-maintenance",
  "/services/fire-safety-audits",
  "/services/fire-safety-training",
  "/industries",
  "/industries/manufacturing",
  "/projects",
  "/equipment",
  "/equipment/co2-extinguisher",
  "/resources",
  "/resources/choosing-the-right-fire-extinguisher",
  "/contact",
  "/request-a-quote",
  "/request-an-amc",
  "/privacy-policy",
  "/terms",
];

test.describe("routes", () => {
  for (const route of ROUTES) {
    test(`renders ${route} with one h1, a title and a canonical URL`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/Safe Bharat/);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toMatch(route === "/" ? /^https?:\/\/[^/]+\/?$/ : new RegExp(`${route}$`));
    });
  }

  for (const route of ["/services/not-a-service", "/projects/anything", "/equipment/unknown", "/resources/nope", "/no-such-page"]) {
    test(`returns the branded 404 for ${route}`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
    });
  }

  test("pending resources are noindex and not in the sitemap", async ({ page, request }) => {
    await page.goto("/resources/choosing-the-right-fire-extinguisher");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/services/amc-maintenance");
    expect(sitemap).not.toContain("/resources/choosing-the-right-fire-extinguisher");
  });

  test("sends security headers", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});

test.describe("navigation", () => {
  test("services dropdown opens, closes with Escape and navigates", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    const trigger = nav.getByRole("button", { name: "Services" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await nav.getByRole("link", { name: "AMC & Maintenance" }).click();
    await expect(page).toHaveURL(/\/services\/amc-maintenance$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("AMC & Maintenance");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("marks the active route", async ({ page }) => {
    await page.goto("/industries/manufacturing");
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Industries" })).toHaveAttribute("aria-current", "page");
  });

  test("primary CTAs lead to working enquiry pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Request a Quote" }).first().click();
    await expect(page).toHaveURL(/\/request-a-quote$/);
    await page.goto("/services/fire-alarm-systems");
    await page.getByRole("main").getByRole("link", { name: "Request a Quote" }).first().click();
    await expect(page).toHaveURL(/service=fire-alarm-systems/);
    await expect(page.getByLabel(/Service required/)).toHaveValue("fire-alarm-systems");
  });

  test("equipment filters narrow the catalogue", async ({ page }) => {
    await page.goto("/equipment");
    await page.getByRole("button", { name: "Fire Alarm Equipment" }).click();
    await expect(page).toHaveURL(/category=fire-alarm-equipment/);
    await expect(page.getByText("5 items")).toBeVisible();
    await page.getByPlaceholder("Search equipment").fill("heat");
    await expect(page.getByText("1 item", { exact: true })).toBeVisible();
  });
});

test.describe("forms", () => {
  test("contact form validates on the client", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Full name is required.")).toBeVisible();
    await expect(page.getByLabel(/Full name/)).toHaveAttribute("aria-invalid", "true");
  });

  test("a quote request is saved and returns a reference number", async ({ page }) => {
    await page.goto("/request-a-quote");
    await page.getByLabel(/Full name/).fill("E2E Tester");
    await page.getByLabel(/Company name/).fill("E2E Industries");
    await page.getByLabel(/Business email/).fill("e2e@example.com");
    await page.getByLabel(/Phone number/).fill("+91 98765 43210");
    await page.getByLabel(/Site location/).fill("Visakhapatnam");
    await page.getByLabel(/Service required/).selectOption("fire-extinguishers");
    await page.getByLabel(/Project description/).fill("Forty extinguishers for a new warehouse.");
    await page.getByLabel(/I agree that Safe Bharat/).check();
    // Wait for Cloudflare's test widget to issue its token.
    await expect(page.locator('input[name="cf-turnstile-response"]')).toHaveValue(/.+/, { timeout: 20_000 });
    await page.getByRole("button", { name: "Request quotation" }).click();
    await expect(page.getByRole("status")).toContainText("Your enquiry has been received", { timeout: 20_000 });
    await expect(page.getByRole("status")).toContainText(/SB-\d{6}-[2-9A-Z]{5}/);
  });
});

test.describe("chatbot", () => {
  test("opens, shows the honest offline state, captures a lead and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const launcher = page.getByRole("button", { name: /Ask Safe Bharat/ });
    await launcher.click();
    const dialog = page.getByRole("dialog", { name: "Safe Bharat Assistant" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/assistant is offline/i)).toBeVisible();
    await dialog.getByRole("button", { name: "Request a quotation", exact: true }).click();
    const form = dialog.getByRole("group", { name: "Quotation request" });
    await form.getByLabel(/Full name/).fill("Chat Lead");
    await form.getByLabel(/^Email/).fill("chat@example.com");
    await form.getByLabel(/^Phone/).fill("+91 91234 56789");
    await form.getByLabel(/^Company/).fill("Chat Co");
    await form.getByLabel(/Site location/).fill("Gajuwaka");
    await form.getByLabel(/^Service/).selectOption("amc-maintenance");
    await form.getByLabel(/Requirement details/).fill("AMC for 50 extinguishers.");
    await form.getByRole("button", { name: "Review details" }).click();
    await form.getByRole("checkbox").check();
    await expect(form.locator('input[name="cf-turnstile-response"]')).toHaveValue(/.+/, { timeout: 20_000 });
    await form.getByRole("button", { name: "Submit request" }).click();
    await expect(dialog.getByText(/Your reference number is SB-\d{6}-[2-9A-Z]{5}/)).toBeVisible({ timeout: 20_000 });
    await dialog.getByRole("button", { name: "Minimise chat" }).focus();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /Ask Safe Bharat/ })).toBeFocused();
  });

  test("does not open by itself", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(page.getByRole("dialog", { name: "Safe Bharat Assistant" })).toHaveCount(0);
  });
});

test.describe("images and assets", () => {
  for (const route of ["/", "/services", "/services/fire-safety-training", "/industries", "/industries/pharmaceutical", "/resources", "/resources/planning-an-amc", "/about"]) {
    test(`all images load and no requests fail on ${route}`, async ({ page }) => {
      const failures: string[] = [];
      page.on("response", (r) => {
        if (r.status() >= 400 && !r.url().includes("challenges.cloudflare.com")) failures.push(`${r.status()} ${r.url()}`);
      });
      page.on("requestfailed", (r) => {
        if (!r.url().includes("challenges.cloudflare.com")) failures.push(`failed ${r.url()}`);
      });
      await page.goto(route);
      // Scroll through the page so lazy-loaded images are requested.
      for (let y = 0; y < 12000; y += 500) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(40);
      }
      await page.waitForLoadState("networkidle").catch(() => undefined);
      const broken = await page.$$eval("img", (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
      expect(broken).toEqual([]);
      const external = await page.$$eval("img", (imgs) => imgs.map((i) => i.currentSrc || i.src).filter((s) => s && !s.startsWith(location.origin) && !s.startsWith("data:")));
      expect(external).toEqual([]);
      expect(failures).toEqual([]);
    });
  }
});

test.describe("accessibility", () => {
  for (const route of ["/", "/services/amc-maintenance", "/equipment", "/contact", "/request-a-quote", "/request-an-amc", "/projects"]) {
    test(`has no serious or critical axe violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(1200); // let the preloader finish
      const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    });
  }
});

test.describe("footer", () => {
  for (const route of ["/", "/contact"]) {
    test(`floating controls do not cover footer links or notices on ${route}`, async ({ page }) => {
      await expectFooterUncovered(page, route);
    });
  }

  test("keeps the legal links, image credits and the 112 emergency link", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy");
    await expect(footer.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/terms");
    await expect(footer.getByRole("link", { name: "Image credits" })).toHaveAttribute("href", "/image-credits");
    await expect(footer.getByRole("link", { name: "112", exact: true })).toHaveAttribute("href", "tel:112");
    await expect(footer).toContainText("All rights reserved.");
    await expect(footer.getByRole("img")).toHaveCount(0);
  });
});
