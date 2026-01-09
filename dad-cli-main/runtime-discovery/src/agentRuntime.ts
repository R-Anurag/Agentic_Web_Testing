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
  try {
    if (!page) {
      page = await launchBrowser();
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
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
  } catch (error) {
    console.error("❌ UI discovery failed:", error instanceof Error ? error.message : String(error));
    return {
      state_id: crypto.randomUUID(),
      route: "/error",
      title: "Error",
      available_actions: [],
      entities: {}
    };
  }
}

// -------------------------------------
// Execute Action (SINGLE SOURCE OF TRUTH)
// -------------------------------------
export async function executeAction(
  action: ActionContract
): Promise<Observation> {
  try {
    if (!page) throw new Error("Browser not initialized");
    if (!action?.action_id) throw new Error("Invalid action: missing action_id");

    const networkCalls: Observation["networkCalls"] = [];
    const consoleErrors: string[] = [];

    const onResponse = (res: any) => {
      try {
        networkCalls.push({
          method: res.request().method(),
          url: res.url(),
          status: res.status()
        });
      } catch (err) {
        console.warn("⚠️ Failed to capture network call:", err);
      }
    };

    const onConsole = (msg: any) => {
      try {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      } catch (err) {
        console.warn("⚠️ Failed to capture console message:", err);
      }
    };

    page.on("response", onResponse);
    page.on("console", onConsole);

    let skipped = false;

    try {
      // 🔹 Find matching element SAFELY
      const elements = await page.$$("button, a, input, textarea, select");
      let target: any = null;

      for (const el of elements) {
        try {
          const tagName = await el.evaluate(e => e.tagName.toLowerCase());
          let identifier = "";
          
          if (tagName === "input" || tagName === "textarea" || tagName === "select") {
            const placeholder = await el.evaluate(e => e.placeholder || e.name || "");
            identifier = placeholder.toLowerCase().replace(/\s+/g, "_");
          } else {
            const text = await el.innerText();
            identifier = text?.toLowerCase().replace(/\s+/g, "_") || "";
          }

          if (action.action_id.endsWith(identifier)) {
            target = el;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!target) {
        skipped = true;
      } else {
        try {
          await target.scrollIntoViewIfNeeded();
          
          const tagName = await target.evaluate(e => e.tagName.toLowerCase());
          const inputType = await target.evaluate(e => e.type || "");
          
          if (tagName === "input" || tagName === "textarea") {
            if (inputType === "checkbox" || inputType === "radio") {
              await target.click({ timeout: 3000 });
            } else {
              await target.fill("test input", { timeout: 3000 });
            }
          } else if (tagName === "select") {
            const options = await target.evaluate(e => Array.from(e.options).map(opt => opt.value));
            if (options.length > 0) {
              await target.selectOption(options[0], { timeout: 3000 });
            }
          } else {
            await target.click({ timeout: 3000 });
          }
        } catch (err) {
          skipped = true;
        }
      }

      await waitForPageStability(page);
    } catch (error) {
      console.error("❌ Action execution failed:", error instanceof Error ? error.message : String(error));
      skipped = true;
    }

    let screenshotPath = "";
    try {
      screenshotPath = `screenshots/${action.action_id}_${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath });
    } catch (error) {
      console.warn("⚠️ Screenshot failed:", error instanceof Error ? error.message : String(error));
    }

    page.off("response", onResponse);
    page.off("console", onConsole);

    return {
      actionId: action.action_id,
      networkCalls,
      consoleErrors,
      screenshotPath,
      skipped
    };
  } catch (error) {
    console.error("❌ Execute action failed:", error instanceof Error ? error.message : String(error));
    return {
      actionId: action?.action_id || "unknown",
      networkCalls: [],
      consoleErrors: [],
      screenshotPath: "",
      skipped: true
    };
  }
}
