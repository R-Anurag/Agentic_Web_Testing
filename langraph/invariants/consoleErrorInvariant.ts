export function checkConsoleErrors(state: any) {
  const steps = state.steps || [];
  const lastStep = steps[steps.length - 1];
  
  if (!lastStep?.observation) return null;
  
  const consoleErrors = lastStep.observation.consoleErrors || [];
  
  if (consoleErrors.length > 0) {
    return {
      type: "CONSOLE_ERROR",
      severity: "MEDIUM",
      message: `Console errors detected: ${consoleErrors.join(", ")}`
    };
  }
  
  return null;
}