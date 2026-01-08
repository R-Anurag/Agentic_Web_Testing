export function checkRouteInvariant(state: any) {
  if (!state.last_action) return null;

  const expected = state.knowledge?.state_graph?.[
    state.ui_state?.state_id
  ];

  if (!expected) return null;

  if (expected.route !== state.ui_state?.route) {
    return {
      severity: "MEDIUM",
      category: "ROUTE_MISMATCH",
      action_id: state.last_action.action_id,
      description: "UI route does not match expected state",
      evidence: {
        expected: expected.route,
        observed: state.ui_state?.route
      }
    };
  }

  return null;
}
