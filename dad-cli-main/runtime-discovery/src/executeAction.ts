import { Page } from "playwright";
import { ActionContract, Observation } from "./types";

export async function executeAction(
  page: Page,
  action: ActionContract
): Promise<Observation> {

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

  const [type, rawLabel] = action.action_id.split(":");
  const label = rawLabel?.replace(/_/g, " ");

  let element = null;

  try {
    if (type === "link") {
      element = page
        .getByRole("link", { name: new RegExp(label, "i") })
        .first();
    }

    if (type === "button") {
      element = page
        .getByRole("button", { name: new RegExp(label, "i") })
        .first();
    }

    if (!element) {
      skipped = true;
    } else {
      const beforeUrl = page.url();

      await element.scrollIntoViewIfNeeded();

      await element.click({ timeout: 3000 }).catch(() => {
        skipped = true;
      });

      // Wait for SPA OR full navigation
      await Promise.race([
        page.waitForNavigation({ timeout: 5000 }).catch(() => {}),
        page.waitForURL(
          url => url.toString() !== beforeUrl,
          { timeout: 5000 }
        ).catch(() => {})
      ]);
    }
  } catch {
    skipped = true;
  }

  // 📸 ALWAYS TAKE SCREENSHOT (success OR failure)
  const screenshotPath = `screenshots/${action.action_id}_${Date.now()}.png`;
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  // cleanup listeners
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
