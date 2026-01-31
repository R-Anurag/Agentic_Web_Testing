import { chromium } from "playwright";

export async function launchBrowser(headless: boolean = true) {
  console.log(`🌍 Launching browser (headless: ${headless})`);
  if (!headless) {
    console.log("👁️ Browser window should now be visible");
  }
  
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  return page;
}
