export async function validatorNode(state: any) {

  const anomalies = state.anomalies ?? [];

  const success = anomalies.length === 0;

  console.log(
    success ? "✅ Fix successful" : "❌ Fix failed"
  );

  return {
    ...state,
    validation: {
      success,
      timestamp: Date.now()
    }
  };
}
