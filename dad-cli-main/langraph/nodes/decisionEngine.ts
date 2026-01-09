import { AgentState, DecisionOutput } from "../types.ts";
import type { KnowledgeItem } from "../../knowledge/schema.ts";

export function decisionEngine(state: AgentState): AgentState {
  try {
    const actions = state.ui_state?.available_actions ?? [];
    const steps = state.steps ?? [];

    const memoryContext = (state as any).knowledge_context as {
      memories?: KnowledgeItem[];
      confidence?: number;
    } | undefined;

    let decision: DecisionOutput;

    /* -----------------------------------------
       1️⃣ SMART MEMORY RESOLUTION
    ------------------------------------------*/

    if (
      memoryContext &&
      memoryContext.memories?.length
    ) {
      try {
        // 🔥 Sort by confidence (highest first)
        const sorted = [...memoryContext.memories].sort(
          (a, b) =>
            (b.confidence ?? 0) -
            (a.confidence ?? 0)
        );

        const best = sorted[0];

        // Safety threshold
        if ((best.confidence ?? 0) > 0.6 && best.solution) {

          console.log(
            "🧠 Using best memory:",
            best.solution,
            "confidence:",
            best.confidence
          );

          decision = {
            next_action: {
              action_id: best.solution,
              parameters: {}
            },
            control: "CONTINUE",
            confidence: best.confidence
          };
        } else {
          decision = { next_action: null, control: "TERMINATE" };
        }
      } catch (error) {
        console.error("❌ Memory resolution failed:", error instanceof Error ? error.message : String(error));
        decision = { next_action: null, control: "TERMINATE" };
      }
    } else {
      /* -----------------------------------------
         2️⃣ FALLBACK → EXPLORATION LOGIC
      ------------------------------------------*/

      // 🔴 Nothing discovered
      if (actions.length === 0) {
        decision = {
          next_action: null,
          control: "TERMINATE"
        };
      } else if (steps.length < 5) {
        // 🟢 FORCE exploration for first N steps
        const executed = new Set(
          steps.map(s => s.action.action_id)
        );

        const next = actions.find(a => !executed.has(a));

        if (!next) {
          decision = {
            next_action: null,
            control: "TERMINATE"
          };
        } else {
          console.log("🤔 Exploring new action:", next);

          decision = {
            next_action: {
              action_id: next,
              parameters: {}
            },
            control: "CONTINUE",
            confidence: 0.8 // High confidence for exploration
          };
        }
      } else {
        // 🟡 After exploration phase → allow termination
        decision = {
          next_action: null,
          control: "TERMINATE"
        };
      }
    }

    return {
      ...state,
      decision,
      next_action: decision.next_action,
      control: decision.control
    };
  } catch (error) {
    console.error("❌ Decision engine failed:", error instanceof Error ? error.message : String(error));
    return {
      ...state,
      decision: {
        next_action: null,
        control: "TERMINATE"
      },
      next_action: null,
      control: "TERMINATE"
    };
  }
}
