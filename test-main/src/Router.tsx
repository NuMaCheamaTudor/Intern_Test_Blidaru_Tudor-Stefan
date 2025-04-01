// src/Router.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./App";

function isAuthenticated() {
    return localStorage.getItem("user") !== null;
}

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/dashboard"
                element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" replace />}
            />
        </Routes>
    );
}
