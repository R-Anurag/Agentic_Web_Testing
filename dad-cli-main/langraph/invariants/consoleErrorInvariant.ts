export function checkConsoleErrors(state: any) {
  const errors = state.observation?.console_errors ?? [];

  if (errors.length > 0) {
    return {
      severity: "HIGH",
      category: "FRONTEND_EXCEPTION",
      action_id: state.last_action?.action_id ?? "unknown",
      description: "Console errors detected during action",
      evidence: { errors }
    };
  }

  return null;
}
