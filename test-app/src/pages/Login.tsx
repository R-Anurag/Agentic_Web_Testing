import { useState } from "react";
import { fakeLogin } from "../api/fakeApi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit() {
    setError("");
    try {
      await fakeLogin(user, pass);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <input placeholder="username" onChange={e => setUser(e.target.value)} />
      <input placeholder="password" type="password" onChange={e => setPass(e.target.value)} />

      <button onClick={submit}>Submit Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
