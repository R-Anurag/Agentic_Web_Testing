import { useState } from "react";

export default function FormFlow() {
  const [step, setStep] = useState(1);

  return (
    <div>
      <h2>Form Step {step}</h2>

      {step === 1 && (
        <>
          <input placeholder="Name" />
          <button onClick={() => setStep(2)}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <input placeholder="Email" />
          <button onClick={() => setStep(3)}>Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <p>Review</p>
          <button onClick={() => alert("Submitted!")}>Submit</button>
        </>
      )}
    </div>
  );
}
