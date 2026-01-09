import fs from "fs";
import { discoverUI, executeAction } from "./agentRuntime.js";
import { runPrompt3 } from "../../langraph/index.ts";
import { AgentState, AgentStep, ActionContract } from "./types.js";
import { storeKnowledge } from "../../knowledge/store.ts";

const args = process.argv.slice(2);
const headfulIndex = args.indexOf('--headful');
const headless = headfulIndex === -1;

// Remove --headful flag from args to get URL
if (headfulIndex !== -1) {
  args.splice(headfulIndex, 1);
}

const targetUrl = args[0];

if (!targetUrl) {
  console.error("Usage: npm run start <url> or npm run start-headful <url>");
  process.exit(1);
}

if (!headless) {
  console.log("🖥️ Running in headful mode (browser visible)");
  console.log("🕰️ Browser will stay open during automation...");
}

/* ----------------------------------------
   Runtime Bridge Function
----------------------------------------- */
async function createRuntimeExecutor(targetUrl: string) {
  return async (action_id: string, parameters: Record<string, any>): Promise<void> => {
    const action: ActionContract = { action_id, parameters };
    await executeAction(action);
  };
}

/* ----------------------------------------
   Persist Agent Knowledge
----------------------------------------- */
async function persistRunKnowledge(state: AgentState) {
  try {
    for (const step of state.steps) {
      try {
        // ❌ Store failures
        if (step.observation.skipped) {
          await storeKnowledge({
            type: "error",
            content: `Action ${step.action.action_id} failed`,
            run_id: state.run_id,
            metadata: {
              endpoint: state.runtime.url,
              env: "runtime",
              timestamp: new Date().toISOString()
            }
          });
        }

        // ⚠️ Store anomalies
        if (step.anomalies && step.anomalies.length > 0) {
          for (const anomaly of step.anomalies) {
            await storeKnowledge({
              type: "error",
              content: JSON.stringify(anomaly),
              run_id: state.run_id,
              metadata: {
                endpoint: state.runtime.url,
                env: "runtime",
                timestamp: new Date().toISOString()
              }
            });
          }
        }

        // ✅ Store successful flows with solution
        if (!step.observation.skipped) {
          await storeKnowledge({
            type: "flow",
            content: `Successful action: ${step.action.action_id}`,
            solution: step.action.action_id, // Add solution field
            confidence: 0.8,
            run_id: state.run_id,
            metadata: {
              endpoint: state.runtime.url,
              env: "runtime",
              timestamp: new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.error("❌ Failed to store knowledge for step:", step.step, error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error("❌ Failed to persist run knowledge:", error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  try {
    const state: AgentState = {
      schema_version: "1.0",
      run_id: `run-${Date.now()}`,
      runtime: {
        url: targetUrl,
        browser: "chromium",
        timestamp: new Date().toISOString(),
        execute: await createRuntimeExecutor(targetUrl) // Add runtime bridge
      },
      steps: []
    };

    console.log("[Runtime] Target URL:", targetUrl);

    // Initial UI discovery
    try {
      state.ui_state = await discoverUI(targetUrl, headless);
    } catch (error) {
      console.error("❌ Initial UI discovery failed:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    let lastStateId: string | null = null;
    let consecutiveFailures = 0;

    for (let step = 0; step < 10; step++) {
      try {
        console.log(`\n[Loop] Step ${step + 1}`);
        console.log("[DEBUG] Available actions:", state.ui_state?.available_actions);

        // 🔒 Safety stop
        if (consecutiveFailures >= 5) {
          console.log("[Loop] Too many failed actions. Stopping.");
          break;
        }

        // ---------------------------------
        // FORCE modal dismissal first
        // ---------------------------------
        const modalActions = state.ui_state?.available_actions?.filter(actionId => {
          // Check if this is likely a modal dismiss button
          const lowerAction = actionId.toLowerCase();
          return lowerAction.includes('close') || 
                 lowerAction.includes('cancel') || 
                 lowerAction.includes('ok') || 
                 lowerAction.includes('dismiss') ||
                 lowerAction.includes('accept') ||
                 lowerAction.includes('continue') ||
                 lowerAction.includes('agree');
        }) || [];

        const tried = new Set(state.steps.map(s => s.action.action_id));
        const untriedModalAction = modalActions.find(a => !tried.has(a));

        // If there's an untried modal action, prioritize it
        if (untriedModalAction) {
          console.log(`🚨 Forcing modal dismissal: ${untriedModalAction}`);
          state.next_action = {
            action_id: untriedModalAction,
            parameters: {}
          };
          state.control = "CONTINUE";
        }
        // ---------------------------------
        // Prompt-3 decision (now returns full state)
        // ---------------------------------
        else {
          let updatedState;
          try {
            updatedState = await runPrompt3(state);
            Object.assign(state, updatedState);
          } catch (error) {
            console.error("❌ LangGraph decision failed:", error instanceof Error ? error.message : String(error));
            // Force fallback on LangGraph failure
            state.control = "TERMINATE";
            state.next_action = undefined;
          }
        }

        // ---------------------------------
        // FORCE fallback if Prompt-3 stops
        // ---------------------------------
        if (state.control !== "CONTINUE" || !state.next_action) {
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

          state.next_action = {
            action_id: fallback,
            parameters: {}
          };
          state.control = "CONTINUE";
        }

        console.log("[Loop] Executing:", state.next_action.action_id);

        // ---------------------------------
        // Execute action
        // ---------------------------------
        let observation;
        try {
          observation = await executeAction(state.next_action);
        } catch (error) {
          console.error("❌ Action execution failed:", error instanceof Error ? error.message : String(error));
          observation = {
            actionId: state.next_action.action_id,
            networkCalls: [],
            consoleErrors: [],
            screenshotPath: "",
            skipped: true
          };
        }

        // ---------------------------------
        // Refresh UI and detect changes
        // ---------------------------------
        const oldActions = new Set(state.ui_state?.available_actions || []);
        const oldModalCount = state.ui_state?.available_actions?.filter(a => 
          a.toLowerCase().includes('close') || 
          a.toLowerCase().includes('cancel') || 
          a.toLowerCase().includes('ok')
        ).length || 0;

        try {
          state.ui_state = await discoverUI(targetUrl, headless);
        } catch (error) {
          console.error("❌ UI refresh failed:", error instanceof Error ? error.message : String(error));
          // Continue with existing UI state
        }

        const newActions = new Set(state.ui_state?.available_actions || []);
        const newModalCount = state.ui_state?.available_actions?.filter(a => 
          a.toLowerCase().includes('close') || 
          a.toLowerCase().includes('cancel') || 
          a.toLowerCase().includes('ok')
        ).length || 0;

        // Detect significant state changes
        const actionsAdded = [...newActions].filter(a => !oldActions.has(a));
        const actionsRemoved = [...oldActions].filter(a => !newActions.has(a));
        const modalDismissed = oldModalCount > 0 && newModalCount === 0;

        if (actionsAdded.length > 0) {
          console.log(`🆕 New elements appeared:`, actionsAdded);
        }
        if (actionsRemoved.length > 0) {
          console.log(`🗑️ Elements disappeared:`, actionsRemoved);
        }
        if (modalDismissed) {
          console.log(`✅ Modal dismissed - UI unlocked`);
          consecutiveFailures = 0; // Reset failures on modal dismissal
        }

        const newStateId = state.ui_state?.state_id ?? null;

        // Better progress detection
        const significantChange = actionsAdded.length > 0 || actionsRemoved.length > 0 || modalDismissed;
        const noProgress = lastStateId !== null && newStateId === lastStateId && !significantChange;

        lastStateId = newStateId;

        const failed = observation.skipped || noProgress;

        if (failed && !modalDismissed) consecutiveFailures++;
        else consecutiveFailures = 0;

        const agentStep: AgentStep = {
          step,
          action: state.next_action,
          observation: {
            ...observation,
            skipped: failed
          },
          anomalies: state.anomalies ?? []
        };

        state.steps.push(agentStep);
      } catch (error) {
        console.error(`❌ Step ${step + 1} failed:`, error instanceof Error ? error.message : String(error));
        consecutiveFailures++;
        if (consecutiveFailures >= 5) {
          console.log("[Loop] Too many step failures. Stopping.");
          break;
        }
      }
    }

    // ---------------------------------
    // Save run to file
    // ---------------------------------
    try {
      fs.writeFileSync(
        `runs/${state.run_id}.json`,
        JSON.stringify(state, null, 2)
      );
    } catch (error) {
      console.error("❌ Failed to save run file:", error instanceof Error ? error.message : String(error));
    }

    // ---------------------------------
    // Persist knowledge to KB
    // ---------------------------------
    await persistRunKnowledge(state);

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

