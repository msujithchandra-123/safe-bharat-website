import { expect, type Page } from "@playwright/test";

/**
 * Scrolls to the end of the page and checks that no fixed control (chat
 * launcher, contact shortcut, mobile quick-contact bar) sits on top of any
 * footer link or bottom-bar notice: at the start, middle and end of every line
 * of text, the topmost element must be the footer element itself (or the
 * sticky site header, which normally covers content scrolled beneath it).
 */
export async function expectFooterUncovered(page: Page, route: string) {
  await page.goto(route);
  await page.waitForTimeout(1200); // let the preloader finish
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  const covered = await page.evaluate(() => {
    const footer = document.querySelector("footer");
    if (!footer) return ["no footer"];
    const targets = [...footer.querySelectorAll<HTMLElement>("a, div.border-t p")];
    const problems: string[] = [];
    for (const el of targets) {
      for (const r of el.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue;
        const y = r.top + r.height / 2;
        for (const x of [r.left + 2, r.left + r.width / 2, r.right - 2]) {
          if (y < 0 || y > window.innerHeight) continue;
          const top = document.elementFromPoint(x, y);
          // The sticky site header covers whatever scrolls beneath it at the top of the
          // viewport; that is expected. Only the bottom floating controls are checked.
          if (top && !el.contains(top) && !top.contains(el) && !top.closest("header")) {
            problems.push(`"${el.textContent?.trim().slice(0, 40)}" covered by <${top.tagName.toLowerCase()}> ${top.getAttribute("aria-label") ?? top.textContent?.trim().slice(0, 30)}`);
            break;
          }
        }
      }
    }
    return [...new Set(problems)];
  });
  expect(covered, route).toEqual([]);
}
