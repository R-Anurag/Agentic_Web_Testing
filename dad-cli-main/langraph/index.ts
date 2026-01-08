import { buildPrompt3Graph } from "./graph";
import { AgentState } from "./types";

const graph = buildPrompt3Graph();

export async function runPrompt3(state: AgentState) {
  const result = await graph.invoke(state);
  return {
    next_action: result.next_action,
    control: result.control,
    anomalies: result.anomalies ?? []
  };
}
