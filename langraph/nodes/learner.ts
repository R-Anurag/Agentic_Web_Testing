import { storeKnowledge } from "../../knowledge/store.ts";

export async function learnerNode(state: any) {

  const diag = state.diagnosis;
  const exec = state.execution;
  const val = state.validation;

  if (!diag || !exec || !val) {
    return state;
  }

  console.log("📚 Learning from result");

  await storeKnowledge({
    type: "fix",
    content: diag.raw_error,
    run_id: state.run_id,

    error_signature: diag.error_signature,
    root_cause: diag.root_cause,

    solution: exec.action_id,
    fix_steps: [],

    outcome: val.success ? "success" : "failure",

    confidence: val.success ? 0.7 : 0.2,

    metadata: {
      timestamp: new Date().toISOString(),
      tags: ["auto-learn"]
    }
  });

  return state;
}
