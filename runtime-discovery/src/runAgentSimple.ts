import fs from "fs";
import { discoverUI, executeAction } from "./agentRuntime.js";
import { AgentState, AgentStep, ActionContract } from "./types.js";

const [, , targetUrl] = process.argv;

if (!targetUrl) {
  console.error("Usage: node runAgent.js <url>");
  process.exit(1);
}

async function main() {
  try {
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
    try {
      state.ui_state = await discoverUI(targetUrl);
      console.log("[UI] Discovered actions:", state.ui_state?.available_actions);
    } catch (error) {
      console.error("❌ Initial UI discovery failed:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    let consecutiveFailures = 0;

    // Simple action execution loop
    for (let step = 0; step < 5; step++) {
      try {
        console.log(`\n[Loop] Step ${step + 1}`);

        if (consecutiveFailures >= 3) {
          console.log("[Loop] Too many failed actions. Stopping.");
          break;
        }

        const tried = new Set(state.steps.map(s => s.action.action_id));
        const nextAction = state.ui_state?.available_actions?.find(a => !tried.has(a));

        if (!nextAction) {
          console.log("[Loop] No more actions to try.");
          break;
        }

        console.log("[Loop] Executing:", nextAction);

        const action: ActionContract = {
          action_id: nextAction,
          parameters: {}
        };

        let observation;
        try {
          observation = await executeAction(action);
        } catch (error) {
          console.error("❌ Action execution failed:", error instanceof Error ? error.message : String(error));
          observation = {
            actionId: action.action_id,
            networkCalls: [],
            consoleErrors: [],
            screenshotPath: "",
            skipped: true
          };
        }

        // Refresh UI
        try {
          state.ui_state = await discoverUI(targetUrl);
        } catch (error) {
          console.error("❌ UI refresh failed:", error instanceof Error ? error.message : String(error));
        }

        const failed = observation.skipped;
        if (failed) consecutiveFailures++;
        else consecutiveFailures = 0;

        const agentStep: AgentStep = {
          step,
          action,
          observation: {
            ...observation,
            skipped: failed
          },
          anomalies: []
        };

        state.steps.push(agentStep);
      } catch (error) {
        console.error(`❌ Step ${step + 1} failed:`, error instanceof Error ? error.message : String(error));
        consecutiveFailures++;
      }
    }

    // Save run to file
    try {
      if (!fs.existsSync('runs')) {
        fs.mkdirSync('runs');
      }
      fs.writeFileSync(
        `runs/${state.run_id}.json`,
        JSON.stringify(state, null, 2)
      );
      console.log("✅ Run saved:", `runs/${state.run_id}.json`);
    } catch (error) {
      console.error("❌ Failed to save run file:", error instanceof Error ? error.message : String(error));
    }

    console.log("✅ Run complete:", state.run_id);
  } catch (error) {
    console.error("❌ Main execution failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(err => {
  console.error("❌ Runtime failed:");
  console.dir(err, { depth: null });
  process.exit(1);
});