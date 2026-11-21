import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Infrastructure from "./pages/Infrastructure/Infrastructure";
import Deployments from "./pages/Deployments/Deployments";
import Security from "./pages/Security/Security";
import Monitoring from "./pages/Monitoring/Monitoring";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={<MainLayout><Dashboard /></MainLayout>}
        />

        <Route
          path="/infrastructure"
          element={<MainLayout><Infrastructure /></MainLayout>}
        />

        <Route
          path="/deployments"
          element={<MainLayout><Deployments /></MainLayout>}
        />

        <Route
          path="/security"
          element={<MainLayout><Security /></MainLayout>}
        />

        <Route
          path="/monitoring"
          element={<MainLayout><Monitoring /></MainLayout>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;