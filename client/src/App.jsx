import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workouts from "./pages/Workouts.jsx";
import Goals from "./pages/Goals.jsx";
import WeightTracker from "./pages/WeightTracker.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";
import { clearAccountIdentity, setAccountIdentity } from "./utils/accountStorage.js";

// Every page is rendered inside <Layout /> (sidebar + header + mobile nav)
export default function App() {
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;

    const restoreAccount = async () => {
      let token = "";
      try {
        token = localStorage.getItem("fittrack-token") || "";
        if (!token) {
          clearAccountIdentity();
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(result.message || "Could not restore your account session.");
          error.status = response.status;
          throw error;
        }
        setAccountIdentity(result.user);
      } catch (error) {
        if (token && (error.status === 401 || error.status === 404)) {
          localStorage.removeItem("fittrack-token");
          clearAccountIdentity();
        }
        if (active) setSessionError(error.message || "Could not load your account.");
      } finally {
        if (active) setSessionReady(true);
      }
    };

    restoreAccount();
    return () => {
      active = false;
    };
  }, []);

  if (!sessionReady) {
    return <div className="panel profile-loading" role="status">Loading your account...</div>;
  }

  return (
    <>
      {sessionError && <p className="form-error" role="alert">{sessionError}</p>}
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="goals" element={<Goals />} />
          <Route path="weight" element={<WeightTracker />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
