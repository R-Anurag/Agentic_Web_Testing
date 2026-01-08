import fs from "fs";
import { discoverUI, executeAction } from "./agentRuntime";
import { runPrompt3 } from "../../langraph";
import { AgentState, AgentStep } from "./types";

const [, , targetUrl] = process.argv;

if (!targetUrl) {
  console.error("Usage: node runAgent.js <url>");
  process.exit(1);
}

async function main() {
  const state: AgentState = {
    schema_version: "1.0",
    run_id: `run-${Date.now()}`,
    runtime: {
      url: targetUrl,
      browser: "chromium",
      timestamp: new Date().toISOString()
    },
    steps: []
  };

  console.log("[Runtime] Target URL:", targetUrl);

  // Initial UI discovery
  state.ui_state = await discoverUI(targetUrl);

  let lastStateId: string | null = null;
  let consecutiveFailures = 0;

  for (let step = 0; step < 10; step++) {
    console.log(`\n[Loop] Step ${step + 1}`);
    console.log("[DEBUG] Available actions:", state.ui_state?.available_actions);

    // 🔒 Safety stop
    if (consecutiveFailures >= 5) {
      console.log("[Loop] Too many failed actions. Stopping.");
      break;
    }

    // ---------------------------------
    // Prompt-3 decision
    // ---------------------------------
    let decision = await runPrompt3(state);

    // ---------------------------------
    // FORCE fallback if Prompt-3 stops
    // ---------------------------------
    if (decision.control !== "CONTINUE" || !decision.next_action) {
      console.log("[Loop] Prompt-3 stopped. Forcing fallback.");

      const tried = new Set(
        state.steps.map(s => s.action.action_id)
      );

      const fallback = state.ui_state?.available_actions
        ?.find(a => !tried.has(a));

      if (!fallback) {
        console.log("[Loop] No fallback actions left.");
        break;
      }

      decision = {
        ...decision,
        next_action: {
          action_id: fallback,
          parameters: {}
        }
      };
    }

    console.log("[Loop] Executing:", decision.next_action.action_id);

    // ---------------------------------
    // Execute action
    // ---------------------------------
    const observation = await executeAction(decision.next_action);

    // ---------------------------------
    // Refresh UI
    // ---------------------------------
    state.ui_state = await discoverUI(targetUrl);

    const newStateId = state.ui_state?.state_id ?? null;

    const noProgress =
      lastStateId !== null && newStateId === lastStateId;

    lastStateId = newStateId;

    const failed = observation.skipped || noProgress;

    if (failed) consecutiveFailures++;
    else consecutiveFailures = 0;

    const agentStep: AgentStep = {
      step,
      action: decision.next_action,
      observation: {
        ...observation,
        skipped: failed
      },
      anomalies: decision.anomalies ?? []
    };

    state.steps.push(agentStep);
  }

  fs.writeFileSync(
    `runs/${state.run_id}.json`,
    JSON.stringify(state, null, 2)
  );

  console.log("✅ Run complete:", state.run_id);
}

main().catch(err => {
  console.error("❌ Runtime failed:", err);
  process.exit(1);
});
