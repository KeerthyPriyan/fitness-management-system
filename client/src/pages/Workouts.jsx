import { useEffect, useMemo, useState } from "react";
import { Activity, Dumbbell, Plus, Timer, Zap } from "lucide-react";
import FitnessPageBanner from "../components/ui/FitnessPageBanner.jsx";
import { getAccountStorageKey, isPreservedAccount } from "../utils/accountStorage.js";

const STORAGE_KEY = "fittrack-workouts";

const initialWorkouts = [
  { id: 1, name: "Upper body strength", type: "Strength", duration: 45, calories: 380, day: "Mon", difficulty: "Moderate" },
  { id: 2, name: "Interval run", type: "Cardio", duration: 30, calories: 310, day: "Wed", difficulty: "High" },
  { id: 3, name: "Mobility flow", type: "Mobility", duration: 25, calories: 120, day: "Fri", difficulty: "Low" },
  { id: 4, name: "Leg day power", type: "Strength", duration: 50, calories: 420, day: "Sat", difficulty: "High" },
];

const readStoredWorkouts = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : isPreservedAccount() ? initialWorkouts : [];
  } catch {
    return isPreservedAccount() ? initialWorkouts : [];
  }
};

const typeColors = {
  Strength: "brand",
  Cardio: "sun",
  Mobility: "ink",
};

export default function Workouts() {
  const storageKey = getAccountStorageKey(STORAGE_KEY);
  const [workouts, setWorkouts] = useState(() => readStoredWorkouts(storageKey));
  const [filter, setFilter] = useState("All");
  const [draft, setDraft] = useState({
    name: "",
    type: "Strength",
    duration: "40",
    calories: "300",
    day: "Tue",
    difficulty: "Moderate",
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(workouts));
  }, [workouts, storageKey]);

  const filteredWorkouts = useMemo(() => {
    if (filter === "All") return workouts;
    return workouts.filter((workout) => workout.type === filter);
  }, [filter, workouts]);

  const totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
  };

  const handleAddWorkout = (event) => {
    event.preventDefault();
    if (!draft.name.trim()) return;

    const newWorkout = {
      id: Date.now(),
      name: draft.name.trim(),
      type: draft.type,
      duration: Number(draft.duration) || 30,
      calories: Number(draft.calories) || 0,
      day: draft.day,
      difficulty: draft.difficulty,
    };

    setWorkouts((currentWorkouts) => [newWorkout, ...currentWorkouts]);
    setDraft({
      name: "",
      type: "Strength",
      duration: "40",
      calories: "300",
      day: "Tue",
      difficulty: "Moderate",
    });
  };

  const handleDelete = (id) => {
    setWorkouts((currentWorkouts) => currentWorkouts.filter((workout) => workout.id !== id));
  };

  return (
    <div className="page-stack">
      <FitnessPageBanner
        eyebrow="Your weekly plan"
        title="Workouts"
        description="Build a routine that keeps you moving, one session at a time."
        image="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1400&q=85"
        imagePosition="center 44%"
      />

      <section className="stats-grid compact-grid" aria-label="Workout summary">
        <article className="metric-card">
          <span className="metric-icon tone-brand">
            <Dumbbell size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="metric-label">Training time</p>
            <strong>{totalMinutes} min</strong>
            <span>Planned this week</span>
          </div>
        </article>

        <article className="metric-card">
          <span className="metric-icon tone-sun">
            <Zap size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="metric-label">Energy burned</p>
            <strong>{totalCalories} kcal</strong>
            <span>Across all sessions</span>
          </div>
        </article>
      </section>

      <div className="page-grid">
        <section className="panel">
          <div className="panel-head panel-head-tight">
            <h3>Session list</h3>
            <div className="filter-row" aria-label="Workout filters">
              {['All', 'Strength', 'Cardio', 'Mobility'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={filter === option ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <ul className="workout-list">
            {filteredWorkouts.map((workout) => (
              <li key={workout.id} className="workout-card">
                <div className="workout-main">
                  <div className={`workout-icon ${typeColors[workout.type] || "brand"}`}>
                    {workout.type === "Cardio" ? <Activity size={18} aria-hidden="true" /> : <Dumbbell size={18} aria-hidden="true" />}
                  </div>
                  <div>
                    <div className="workout-title-row">
                      <h4>{workout.name}</h4>
                      <span className={`type-badge ${typeColors[workout.type] || "brand"}`}>{workout.type}</span>
                    </div>
                    <div className="workout-meta-row">
                      <span>
                        <Timer size={14} aria-hidden="true" />
                        {workout.duration} min
                      </span>
                      <span>{workout.calories} kcal</span>
                      <span>{workout.day}</span>
                    </div>
                  </div>
                </div>

                <div className="workout-side-row">
                  <span className="difficulty">{workout.difficulty}</span>
                  <button type="button" className="ghost-button" onClick={() => handleDelete(workout.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="panel">
          <div className="panel-head panel-head-tight">
            <h3>Add workout</h3>
          </div>

          <form className="goal-form" onSubmit={handleAddWorkout}>
            <label className="form-field">
              <span>Workout name</span>
              <input name="name" value={draft.name} onChange={handleDraftChange} placeholder="e.g. Sprint circuit" />
            </label>

            <div className="field-grid two-columns">
              <label className="form-field">
                <span>Type</span>
                <select name="type" value={draft.type} onChange={handleDraftChange}>
                  <option>Strength</option>
                  <option>Cardio</option>
                  <option>Mobility</option>
                </select>
              </label>

              <label className="form-field">
                <span>Day</span>
                <select name="day" value={draft.day} onChange={handleDraftChange}>
                  <option>Mon</option>
                  <option>Tue</option>
                  <option>Wed</option>
                  <option>Thu</option>
                  <option>Fri</option>
                  <option>Sat</option>
                  <option>Sun</option>
                </select>
              </label>
            </div>

            <div className="field-grid two-columns">
              <label className="form-field">
                <span>Duration (min)</span>
                <input type="number" name="duration" value={draft.duration} onChange={handleDraftChange} />
              </label>

              <label className="form-field">
                <span>Calories</span>
                <input type="number" name="calories" value={draft.calories} onChange={handleDraftChange} />
              </label>
            </div>

            <label className="form-field">
              <span>Difficulty</span>
              <select name="difficulty" value={draft.difficulty} onChange={handleDraftChange}>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </label>

            <button type="submit" className="primary-button full-width">
              <Plus size={16} aria-hidden="true" />
              Add workout
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
