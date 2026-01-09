import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: "http://127.0.0.1:6333"
});

export const COLLECTION = "dad_agent_kb";
