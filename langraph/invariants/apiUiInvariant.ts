export function checkApiUiInvariant(state: any) {
  const steps = state.steps || [];
  const lastStep = steps[steps.length - 1];
  
  if (!lastStep?.observation) return null;
  
  const networkCalls = lastStep.observation.networkCalls || [];
  const hasApiErrors = networkCalls.some((call: any) => call.status >= 400);
  
  if (hasApiErrors) {
    return {
      type: "API_ERROR",
      severity: "HIGH",
      message: "API calls returning error status codes"
    };
  }
  
  return null;
}