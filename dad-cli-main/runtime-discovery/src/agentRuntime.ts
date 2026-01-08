import { Page } from "playwright";
import { launchBrowser } from "./browser";
import { discoverActions } from "./discoverActions";
import { waitForPageStability } from "./waitForStability";
import { ActionContract, Observation, UIState } from "./types";

let page: Page | null = null;

// -------------------------------------
// Discover UI (Prompt-1)
// -------------------------------------
export async function discoverUI(url: string): Promise<UIState> {
  if (!page) {
    page = await launchBrowser();
    await page.goto(url, { waitUntil: "load" });
  }

  await waitForPageStability(page);

  const actions = await discoverActions(page);

  return {
    state_id: crypto.randomUUID(),
    route: new URL(page.url()).pathname,
    title: await page.title(),
    available_actions: actions
      .filter(a => a.viewportSafe)
      .map(a => a.id),
    entities: {}
  };
}

// -------------------------------------
// Execute Action (SINGLE SOURCE OF TRUTH)
// -------------------------------------
export async function executeAction(
  action: ActionContract
): Promise<Observation> {
  if (!page) throw new Error("Browser not initialized");

  const networkCalls: Observation["networkCalls"] = [];
  const consoleErrors: string[] = [];

  const onResponse = (res: any) => {
    networkCalls.push({
      method: res.request().method(),
      url: res.url(),
      status: res.status()
    });
  };

  const onConsole = (msg: any) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };

  page.on("response", onResponse);
  page.on("console", onConsole);

  let skipped = false;

  // 🔹 Find matching element SAFELY (no async find)
  const elements = await page.$$("button, a");
  let target: any = null;

  for (const el of elements) {
    const text = (await el.innerText())
      ?.toLowerCase()
      .replace(/\s+/g, "_");

    if (!text) continue;

    if (action.action_id.endsWith(text)) {
      target = el;
      break;
    }
  }

  if (!target) {
    skipped = true;
  } else {
    try {
      await target.scrollIntoViewIfNeeded();
      await target.click({ timeout: 3000 });
    } catch {
      skipped = true;
    }
  }

  await waitForPageStability(page);

  const screenshotPath = `screenshots/${action.action_id}_${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath });

  page.off("response", onResponse);
  page.off("console", onConsole);

  return {
    actionId: action.action_id,
    networkCalls,
    consoleErrors,
    screenshotPath,
    skipped
  };
}
