// Re-export from shared types
export * from "../../shared/types";

// Additional runtime-specific types
export type DiscoveredAction = {
  id: string;
  type: "button" | "link" | "input";
  label?: string;
  viewportSafe: boolean;
};
