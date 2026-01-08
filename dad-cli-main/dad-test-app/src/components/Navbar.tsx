import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #ccc" }}>
      <Link to="/">Home</Link>{" | "}
      <Link to="/login">Login</Link>{" | "}
      <Link to="/dashboard">Dashboard</Link>{" | "}
      <Link to="/form-flow">Form Flow</Link>{" | "}
      <Link to="/error">Error Page</Link>
    </nav>
  );
}
