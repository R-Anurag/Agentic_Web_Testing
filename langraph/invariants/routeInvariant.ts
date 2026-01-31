export function checkRouteInvariant(state: any) {
  const currentRoute = state.ui_state?.route;
  const expectedRoute = state.runtime?.url;
  
  if (currentRoute && expectedRoute && !expectedRoute.includes(currentRoute)) {
    return {
      type: "ROUTE_MISMATCH",
      severity: "MEDIUM",
      message: `Route changed unexpectedly: ${currentRoute}`
    };
  }
  
  return null;
}