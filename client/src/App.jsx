import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/modules/:moduleId" element={<ModulePage />} />
      </Route>
    </Routes>
  );
}
