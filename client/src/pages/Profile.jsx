import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  HeartPulse,
  Mail,
  MapPin,
  Trophy,
  User,
} from "lucide-react";
import { clearAccountIdentity, setAccountIdentity } from "../utils/accountStorage.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "fittrack-token";

const emptyProfile = {
  name: "",
  email: "",
  age: "",
  heightCm: "",
  weightKg: "",
  goal: "",
  activity: "Moderate",
  location: "",
};

const toDisplayProfile = (user) => ({
  name: user.name || "",
  email: user.email || "",
  age: String(user.age || ""),
  heightCm: String(user.heightCm || ""),
  weightKg: String(user.weightKg || ""),
  goal: user.goal || "",
  activity: user.activity || "Moderate",
  location: user.location || "",
});

const getInitialToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

async function request(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if ((response.status === 401 || response.status === 404) && token) {
      localStorage.removeItem(TOKEN_KEY);
    }
    const error = new Error(result.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return result;
}

export default function Profile() {
  const [token, setToken] = useState(getInitialToken);
  const [profile, setProfile] = useState(emptyProfile);
  const [authMode, setAuthMode] = useState("register");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(getInitialToken()));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    request("/profile", {}, token)
      .then(({ user }) => {
        if (active) {
          setAccountIdentity(user);
          setProfile(toDisplayProfile(user));
        }
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401 || requestError.status === 404) setToken("");
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = authMode === "register" ? "/auth/register" : "/auth/login";
      const { token: newToken, user } = await request(path, {
        method: "POST",
        body: JSON.stringify({ ...profile, password }),
      });
      localStorage.setItem(TOKEN_KEY, newToken);
      setAccountIdentity(user);
      setProfile(toDisplayProfile(user));
      setPassword("");
      setToken(newToken);
      setSaved(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await request(
        "/profile",
        { method: "PUT", body: JSON.stringify(profile) },
        token
      );
      setProfile(toDisplayProfile(user));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    clearAccountIdentity();
    setToken("");
    setProfile(emptyProfile);
    setAuthMode("login");
    setError("");
  };

  if (loading && !profile.email) {
    return <div className="panel profile-loading" role="status">Loading your profile...</div>;
  }

  if (!token) {
    return (
      <div className="profile-auth-wrap">
        <section className="panel profile-auth">
          <p className="eyebrow accent">Welcome to FitTrack</p>
          <h2>{authMode === "register" ? "Create your account" : "Welcome back"}</h2>
          <p className="profile-auth-intro">
            {authMode === "register"
              ? "Register and fill in your fitness profile to get started."
              : "Sign in to view and update your fitness profile."}
          </p>

          <div className="profile-auth-tabs" role="tablist" aria-label="Account options">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === "register"}
              className={authMode === "register" ? "active" : ""}
              onClick={() => {
                setAuthMode("register");
                setError("");
              }}
            >
              Register
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === "login"}
              className={authMode === "login" ? "active" : ""}
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
            >
              Log in
            </button>
          </div>

          <form className="profile-auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <>
                <div className="field-grid two-columns">
                  <label className="form-field">
                    <span>Full name</span>
                    <input name="name" value={profile.name} onChange={handleProfileChange} autoComplete="name" required maxLength="80" />
                  </label>
                  <label className="form-field">
                    <span>Age</span>
                    <input name="age" type="number" min="13" max="120" value={profile.age} onChange={handleProfileChange} required />
                  </label>
                  <label className="form-field">
                    <span>Height (cm)</span>
                    <input name="heightCm" type="number" min="80" max="250" step="0.1" value={profile.heightCm} onChange={handleProfileChange} required />
                  </label>
                  <label className="form-field">
                    <span>Weight (kg)</span>
                    <input name="weightKg" type="number" min="20" max="500" step="0.1" value={profile.weightKg} onChange={handleProfileChange} required />
                  </label>
                </div>
                <label className="form-field">
                  <span>Primary fitness goal</span>
                  <input name="goal" value={profile.goal} onChange={handleProfileChange} placeholder="e.g. Build strength" required maxLength="120" />
                </label>
                <label className="form-field">
                  <span>Activity level</span>
                  <select name="activity" value={profile.activity} onChange={handleProfileChange}>
                    <option>Light</option>
                    <option>Moderate</option>
                    <option>High</option>
                    <option>Elite</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Location (optional)</span>
                  <input name="location" value={profile.location} onChange={handleProfileChange} autoComplete="address-level1" maxLength="100" />
                </label>
              </>
            )}

            <label className="form-field">
              <span>Email</span>
              <input name="email" type="email" value={profile.email} onChange={handleProfileChange} autoComplete="email" required maxLength="254" />
            </label>
            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                minLength="8"
                maxLength="128"
                required
              />
              {authMode === "register" && <span className="field-hint">Use at least 8 characters.</span>}
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button full-width" type="submit" disabled={loading}>
              {loading ? "Please wait..." : authMode === "register" ? "Create account" : "Log in"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  const height = Number(profile.heightCm);
  const weight = Number(profile.weightKg);
  const bmi = height > 0 && weight > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : "—";
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Personal details</p>
          <h2>Profile</h2>
        </div>
        <div className="profile-header-actions">
          <button className="ghost-button" type="button" onClick={handleLogout}>Log out</button>
          <button className="primary-button" type="submit" form="profile-form" disabled={loading}>
            {loading ? "Saving..." : saved ? "Saved" : "Save changes"}
          </button>
        </div>
      </header>

      <section className="profile-hero panel">
        <div className="profile-identity">
          <div className="profile-avatar" aria-label="Profile avatar">{initials}</div>
          <div>
            <p className="eyebrow accent">Fitness profile</p>
            <h3>{profile.name}</h3>
            <div className="profile-badges">
              <span className="chip">FitTrack member</span>
              <span className="chip chip-sun">{profile.activity} activity</span>
            </div>
          </div>
        </div>
        <div className="profile-meta">
          <div><Mail size={16} aria-hidden="true" /><span>{profile.email}</span></div>
          {profile.location && <div><MapPin size={16} aria-hidden="true" /><span>{profile.location}</span></div>}
          <div><CalendarDays size={16} aria-hidden="true" /><span>{profile.age} years old</span></div>
        </div>
      </section>

      <section className="stats-grid compact-grid" aria-label="Profile summary">
        <article className="metric-card">
          <span className="metric-icon tone-brand"><Activity size={18} aria-hidden="true" /></span>
          <div><p className="metric-label">BMI</p><strong>{bmi}</strong><span>Based on current height and weight</span></div>
        </article>
        <article className="metric-card">
          <span className="metric-icon tone-brand"><Trophy size={18} aria-hidden="true" /></span>
          <div><p className="metric-label">Primary goal</p><strong>{profile.goal}</strong><span>Your fitness focus</span></div>
        </article>
        <article className="metric-card">
          <span className="metric-icon tone-brand"><HeartPulse size={18} aria-hidden="true" /></span>
          <div><p className="metric-label">Activity level</p><strong>{profile.activity}</strong><span>Self-reported</span></div>
        </article>
      </section>

      <div className="page-grid">
        <form id="profile-form" className="panel form-panel" onSubmit={handleProfileSubmit}>
          <div className="panel-head panel-head-tight"><h3>Fitness profile</h3></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="field-grid two-columns">
            <label className="form-field">
              <span>Full name</span>
              <input name="name" value={profile.name} onChange={handleProfileChange} required maxLength="80" />
            </label>
            <label className="form-field">
              <span>Age</span>
              <input name="age" type="number" min="13" max="120" value={profile.age} onChange={handleProfileChange} required />
            </label>
            <label className="form-field">
              <span>Height (cm)</span>
              <input name="heightCm" type="number" min="80" max="250" step="0.1" value={profile.heightCm} onChange={handleProfileChange} required />
            </label>
            <label className="form-field">
              <span>Weight (kg)</span>
              <input name="weightKg" type="number" min="20" max="500" step="0.1" value={profile.weightKg} onChange={handleProfileChange} required />
            </label>
            <label className="form-field full-width">
              <span>Primary fitness goal</span>
              <input name="goal" value={profile.goal} onChange={handleProfileChange} required maxLength="120" />
            </label>
            <label className="form-field full-width">
              <span>Activity level</span>
              <select name="activity" value={profile.activity} onChange={handleProfileChange}>
                <option>Light</option><option>Moderate</option><option>High</option><option>Elite</option>
              </select>
            </label>
            <label className="form-field full-width">
              <span>Email</span>
              <input name="email" type="email" value={profile.email} readOnly />
            </label>
            <label className="form-field full-width">
              <span>Location (optional)</span>
              <input name="location" value={profile.location} onChange={handleProfileChange} maxLength="100" />
            </label>
          </div>
          {saved && <p className="form-success" role="status">Your profile has been saved.</p>}
        </form>

        <aside className="panel side-panel">
          <div className="panel-head panel-head-tight"><h3>Your details</h3></div>
          <ul className="side-list">
            <li><span className="side-label">Height</span><strong>{profile.heightCm} cm</strong></li>
            <li><span className="side-label">Current weight</span><strong>{profile.weightKg} kg</strong></li>
            <li><span className="side-label">Primary goal</span><strong>{profile.goal}</strong></li>
            <li><span className="side-label">Activity level</span><strong>{profile.activity}</strong></li>
          </ul>
          <div className="mini-card">
            <div className="mini-card-top"><User size={18} aria-hidden="true" /><span>Profile privacy</span></div>
            <p>Your personal details are saved to your account and are not shown publicly.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
