export function checkApiUiInvariant(state: any) {
  const calls = state.observation?.network_calls ?? [];
  const lastAction = state.last_action?.action_id;
  const currentRoute = state.ui_state?.route;

  for (const call of calls) {
    if (call.status === 200 && currentRoute === state.ui_state?.route) {
      return {
        severity: "HIGH",
        category: "INVARIANT_VIOLATION",
        action_id: lastAction ?? "unknown",
        description: "API succeeded but UI did not advance state",
        evidence: {
          url: call.url,
          status: call.status
        }
      };
    }
  }

  return null;
}
