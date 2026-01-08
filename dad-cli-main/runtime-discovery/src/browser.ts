import { chromium } from "playwright";

export async function launchBrowser() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  return page;
}
