import { AgentState, DecisionOutput } from "../types";

export function decisionEngine(state: AgentState): DecisionOutput {
  const actions = state.ui_state?.available_actions ?? [];
  const steps = state.steps ?? [];

  // 🔴 Nothing discovered at all
  if (actions.length === 0) {
    return {
      next_action: null,
      control: "TERMINATE"
    };
  }

  // 🟢 FORCE exploration for first N steps
  if (steps.length < 5) {
    const executed = new Set(
      steps.map(s => s.action.action_id)
    );

    const next = actions.find(a => !executed.has(a));

    if (!next) {
      return {
        next_action: null,
        control: "TERMINATE"
      };
    }

    return {
      next_action: {
        action_id: next,
        parameters: {}
      },
      control: "CONTINUE"
    };
  }

  // 🟡 After exploration phase → allow termination
  return {
    next_action: null,
    control: "TERMINATE"
  };
}
