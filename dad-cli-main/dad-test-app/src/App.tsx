import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import FormFlow from "./pages/FormFlow.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/form-flow" element={<FormFlow />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </>
  );
}
