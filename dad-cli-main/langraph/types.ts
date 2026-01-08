export type ControlSignal = "CONTINUE" | "DEEP_TEST" | "TERMINATE";

export interface ActionContract {
  action_id: string;
  parameters: Record<string, any>;
}

export interface DecisionOutput {
  next_action: ActionContract | null;
  control: ControlSignal;
}

export interface AnomalyReport {
  severity: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  action_id: string;
  description: string;
  evidence?: Record<string, any>;
}
export interface AgentState {
  schema_version: string;
  run_id: string;

  runtime: {
    url: string;
    browser: string;
    timestamp: string;
  };

  ui_state?: {
    state_id: string;
    route: string;
    title: string;
    available_actions: string[];
    entities: Record<string, any>;
  };

  steps?: Array<{
    action: ActionContract;
    observation?: {
      skipped?: boolean;
      error?: string;
      screenshot?: string;
    };
    anomaly?: AnomalyReport;
  }>;

  decision?: DecisionOutput;
  next_action?: {
    action_id: string;
    parameters: Record<string, any>;
  };

  control?: "CONTINUE" | "TERMINATE" | "DEEP_TEST";

  anomalies?: any[];
}
