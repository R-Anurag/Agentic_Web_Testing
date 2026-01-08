export function controlRouter(state: any) {
  const anomalies = state.anomalies ?? [];

  const hasCritical = anomalies.some(
    (a: any) => a.severity === "HIGH"
  );

  if (hasCritical) {
    return {
      ...state,
      decision: {
        next_action: null,
        control: "TERMINATE"
      }
    };
  }

  return state;
}
