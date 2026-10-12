  import { useEffect, useState } from "react";
  import { Link } from "react-router-dom";
  import { Activity, Check, Dumbbell, Flame, Scale, Timer, Wind, Zap } from "lucide-react";
  import ProgressRing from "../components/ui/ProgressRing.jsx";
  import ProgressBar from "../components/ui/ProgressBar.jsx";
  import StatCard from "../components/ui/StatCard.jsx";
  import { isPreservedAccount } from "../utils/accountStorage.js";

  /* Sample data for Stage 1. In Stage 5 this comes from the backend API. */
  const weeklyGoal = { done: 3, total: 5 };

  const week = [
    { day: "Mon", done: true },
    { day: "Tue", done: true },
    { day: "Wed", done: false },
    { day: "Thu", done: true },
    { day: "Fri", done: false },
    { day: "Sat", done: false },
    { day: "Sun", done: false },
  ];

  const stats = [
    { label: "Calories burned", value: "1,840", note: "kcal this week", icon: Flame, tone: "sun" },
    { label: "Active time", value: "215 min", note: "this week", icon: Timer, tone: "brand" },
    { label: "Current weight", value: "72.4 kg", note: "0.8 kg down this month", icon: Scale, tone: "ink" },
    { label: "Streak", value: "4 days", note: "Your best is 9 days", icon: Zap, tone: "sun" },
  ];

  const recentWorkouts = [
    { id: 1, name: "Upper body strength", type: "Strength", duration: 45, calories: 380, date: "Today" },
    { id: 2, name: "Evening run", type: "Cardio", duration: 30, calories: 310, date: "Yesterday" },
    { id: 3, name: "Morning yoga", type: "Flexibility", duration: 25, calories: 120, date: "Tuesday" },
    { id: 4, name: "Leg day", type: "Strength", duration: 50, calories: 420, date: "Sunday" },
  ];

  const goals = [
    { id: 1, title: "Lose 5 kg", current: 3.2, target: 5, unit: "kg" },
    { id: 2, title: "Run 50 km this month", current: 31, target: 50, unit: "km" },
    { id: 3, title: "Complete 20 workouts", current: 12, target: 20, unit: "workouts" },
  ];

  const typeIcons = { Strength: Dumbbell, Cardio: Activity, Flexibility: Wind };
  const workoutImages = {
    Strength: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=240&q=80",
    Cardio: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=240&q=80",
    Flexibility: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=240&q=80",
  };
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  export default function Dashboard() {
    const remaining = weeklyGoal.total - weeklyGoal.done;
    const preserveSampleData = isPreservedAccount();
    const visibleStats = preserveSampleData
      ? stats
      : stats.map((stat) => ({ ...stat, value: "0", note: "No activity yet" }));
    const visibleWeek = preserveSampleData
      ? week
      : week.map(({ day }) => ({ day, done: false }));
    const visibleWorkouts = preserveSampleData ? recentWorkouts : [];
    const visibleGoals = preserveSampleData ? goals : [];
    const [userName, setUserName] = useState("there");
    const [profileError, setProfileError] = useState("");

    useEffect(() => {
      let active = true;
      let token = "";
      try {
        token = localStorage.getItem("fittrack-token") || "";
      } catch {
        setProfileError("Could not access your saved login. Please sign in again.");
        return undefined;
      }

      if (!token) return undefined;

      fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (response) => {
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.message || "Could not load your profile.");
          if (active && typeof result.user?.name === "string" && result.user.name.trim()) {
            setUserName(result.user.name.trim().split(/\s+/)[0]);
            setProfileError("");
          }
        })
        .catch((error) => {
          if (active) setProfileError(`${error.message} Open Profile to sign in again.`);
        });

      return () => {
        active = false;
      };
    }, []);

    return (
      <div className="dashboard">
        {/* Hero: weekly workout progress */}
        <section className="hero">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
          />
          <div>
            <h2>{getGreeting()}, {userName}</h2>
            <p className="dashboard-tagline">Show up, get stronger. Every rep counts.</p>
            {profileError && <p className="form-error" role="alert">{profileError}</p>}
            <p>
              {preserveSampleData && remaining > 0
                ? `${remaining} more ${remaining === 1 ? "workout" : "workouts"} to hit your weekly target.`
                : preserveSampleData
                  ? "You hit your weekly target. Nice work."
                  : "Your fitness dashboard is ready. Log your first workout to get started."}
            </p>
            <ul className="week" aria-label="This week">
              {visibleWeek.map(({ day, done }) => (
                <li key={day} className={"week-day" + (done ? " done" : "")}>
                  <span className="week-dot">{done && <Check size={16} aria-hidden="true" />}</span>
                  <span>{day}</span>
                </li>
              ))}
            </ul>
          </div>

          <ProgressRing value={preserveSampleData ? weeklyGoal.done : 0} max={weeklyGoal.total} size={150} stroke={14}>
            <span className="hero-ring-number">
              {preserveSampleData ? weeklyGoal.done : 0}/{weeklyGoal.total}
            </span>
            <span className="hero-ring-text">workouts</span>
          </ProgressRing>
        </section>

        {/* Quick stats */}
        <section className="stats" aria-label="Quick stats">
          {visibleStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <div className="dash-columns">
          {/* Recent workouts */}
          <section className="panel">
            <div className="panel-head">
              <h3>Recent workouts</h3>
              <Link to="/workouts" className="panel-link">
                View all
              </Link>
            </div>
            <ul>
              {visibleWorkouts.map((w) => {
                const Icon = typeIcons[w.type] || Dumbbell;
                return (
                  <li key={w.id} className="workout-item">
                    <span className="workout-photo">
                      <Icon size={20} aria-hidden="true" />
                      <img
                        src={workoutImages[w.type] || workoutImages.Strength}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                        }}
                      />
                    </span>
                    <div className="workout-info">
                      <p className="workout-name">{w.name}</p>
                      <p className="workout-meta">
                        {w.duration} min, {w.calories} kcal
                      </p>
                    </div>
                    <div className="workout-side">
                      <span className="chip">{w.type}</span>
                      <span className="workout-date">{w.date}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!visibleWorkouts.length && (
              <Link to="/workouts" className="workout-empty-card">
                <img
                  src={workoutImages.Strength}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                />
                <span className="workout-empty-copy">
                  <strong>Your first workout starts here</strong>
                  <span>Plan a session and start building your routine.</span>
                  <span className="workout-empty-link">Create a workout</span>
                </span>
              </Link>
            )}
          </section>

          {/* Goal progress */}
          <section className="panel">
            <div className="panel-head">
              <h3>Goal progress</h3>
              <Link to="/goals" className="panel-link">
                Manage
              </Link>
            </div>
            <ul className="goal-list">
              {visibleGoals.map((g) => (
                <li key={g.id} className="goal">
                  <div className="goal-top">
                    <span className="goal-title">{g.title}</span>
                    <span className="goal-value">
                      {g.current} / {g.target} {g.unit}
                    </span>
                  </div>
                  <ProgressBar value={g.current} max={g.target} label={g.title} />
                </li>
              ))}
            </ul>
            {!visibleGoals.length && <p className="empty-state">No goals yet. Create your first goal on the Goals page.</p>}
          </section>
        </div>
      </div>
    );
  }
