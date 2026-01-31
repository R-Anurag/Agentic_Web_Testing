import { searchKnowledge } from "../../knowledge/retrieve.ts";
import type { KnowledgeItem } from "../../knowledge/schema";

export async function memoryNode(state: any) {

  // Build smart query
  const query =
    state.diagnosis?.error_signature ||
    state.last_error ||
    state.anomalies?.map((a: any) => a.message || a.type).join(" ") ||
    state.steps?.at(-1)?.action?.action_id ||
    "agent runtime behavior";


  // Search KB
  const memories: KnowledgeItem[] = await searchKnowledge(query, {
    type: "error",
    topK: 3
  });

  // Compute confidence
  const avgConfidence =
    memories.length === 0
      ? 0
      : memories.reduce(
          (acc, m) => acc + (m.confidence ?? 0),
          0
        ) / memories.length;

  console.log(
    `🧠 Memory consulted | hits=${memories.length} | confidence=${avgConfidence.toFixed(
      2
    )}`
  );

  return {
    ...state,

    // attach memory context
    knowledge_context: {
      query,
      memories,
      confidence: avgConfidence
    }
  };
}
