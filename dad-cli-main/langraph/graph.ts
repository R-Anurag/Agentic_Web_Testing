import { StateGraph, Annotation } from "@langchain/langgraph";

import { anomalyDetector } from "./nodes/anomalyDetector";
import { decisionEngine } from "./nodes/decisionEngine";
import { controlRouter } from "./nodes/controlRouter";

/**
 * Minimal AgentState schema
 * LangGraph only needs field presence, not types
 */
const AgentStateSchema = Annotation.Root({
  schema_version: Annotation,
  run_id: Annotation,
  runtime: Annotation,
  ui_state: Annotation,
  last_action: Annotation,
  observation: Annotation,
  knowledge: Annotation,
  decision: Annotation,
  anomalies: Annotation
});

export function buildPrompt3Graph() {
  // ⛔ LangGraph TS typings are broken for edges
  // ✅ Relax typing at boundary (this is intentional)
  const graph = new StateGraph(AgentStateSchema) as any;

  graph.addNode("detect_anomalies", anomalyDetector);
  graph.addNode("decide", decisionEngine);
  graph.addNode("control", controlRouter);

  graph.addEdge("__start__", "detect_anomalies");
  graph.addEdge("detect_anomalies", "decide");
  graph.addEdge("decide", "control");
  graph.addEdge("control", "__end__");

  return graph.compile();
}
