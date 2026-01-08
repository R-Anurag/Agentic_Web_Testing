// ------------------------------------
// Network + Observation (Prompt-1)
// ------------------------------------

export type NetworkCall = {
  method: string;
  url: string;
  status: number;
};
export type ActionContract = {
  action_id: string;              // must match UIState.available_actions
  parameters: Record<string, any>;
};
export type Observation = {
  actionId: string;

  networkCalls: NetworkCall[];
  consoleErrors: string[];

  screenshotPath?: string;

  // runtime signals
  skipped?: boolean;

  // optional UI delta after action
  state_delta?: Record<string, any>;
};

// ------------------------------------
// Runtime-discovered action
// ------------------------------------

export type DiscoveredAction = {
  id: string;              // e.g. "button:submit"
  type: "button" | "link" | "input";
  label?: string;
  viewportSafe: boolean;
};

// ------------------------------------
// UI State Snapshot (Prompt-1 output)
// ------------------------------------

export type UIState = {
  state_id: string;
  route: string;
  title: string;

  available_actions: string[];
  entities: Record<string, any>;
};

// ------------------------------------
// Agent Step (Prompt-1 loop unit)
// ------------------------------------

export type AgentStep = {
  step: number;

  action: {
    action_id: string;
    parameters: Record<string, any>;
  };

  observation: Observation;

  anomalies?: AnomalyReport[];
};

// ------------------------------------
// Anomaly (Prompt-3 output)
// ------------------------------------

export type AnomalyReport = {
  severity: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  action_id: string;
  description: string;
  evidence?: Record<string, any>;
};

// ------------------------------------
// Control signals (Prompt-3)
// ------------------------------------

export type ControlSignal =
  | "CONTINUE"
  | "DEEP_TEST"
  | "TERMINATE";

// ------------------------------------
// AgentState (🔥 single source of truth)
// ------------------------------------

export interface AgentState {
  schema_version: "1.0";

  run_id: string;

  runtime: {
    url: string;
    browser: string;
    timestamp: string;
  };

  ui_state?: UIState;

  steps: AgentStep[];
}
