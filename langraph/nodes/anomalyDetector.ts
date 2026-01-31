import { AgentState } from "../types.ts";
import {
  checkApiUiInvariant
} from "../invariants/apiUiInvariant.ts";
import {
  checkRouteInvariant
} from "../invariants/routeInvariant.ts";
import {
  checkConsoleErrors
} from "../invariants/consoleErrorInvariant.ts";

export function anomalyDetector(state: AgentState): AgentState {
  const anomalies = [];

  const checks = [
    checkApiUiInvariant,
    checkRouteInvariant,
    checkConsoleErrors
  ];

  for (const check of checks) {
    const result = check(state);
    if (result) anomalies.push(result);
  }

  return {
    ...state,
    anomalies: anomalies.length ? anomalies : state.anomalies ?? []
  };
}
