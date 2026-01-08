import {
  checkApiUiInvariant
} from "../invariants/apiUiInvariant";
import {
  checkRouteInvariant
} from "../invariants/routeInvariant";
import {
  checkConsoleErrors
} from "../invariants/consoleErrorInvariant";

export function anomalyDetector(state: any) {
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
