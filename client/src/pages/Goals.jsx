import { useEffect, useMemo, useState } from "react";
import { Plus, Target, TrendingUp } from "lucide-react";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import FitnessPageBanner from "../components/ui/FitnessPageBanner.jsx";
import { getAccountStorageKey, isPreservedAccount } from "../utils/accountStorage.js";

const STORAGE_KEY = "fittrack-goals";

const initialGoals = [
  { id: 1, title: "Lose 5 kg", current: 3.2, target: 5, unit: "kg", due: "Dec 12", tone: "brand" },
  { id: 2, title: "Run 50 km", current: 31, target: 50, unit: "km", due: "Nov 30", tone: "sun" },
  { id: 3, title: "Complete 20 workouts", current: 12, target: 20, unit: "sessions", due: "Dec 18", tone: "brand" },
];

const emptyGoal = { title: "", target: "", unit: "kg", due: "" };

const readStoredGoals = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : isPreservedAccount() ? initialGoals : [];
  } catch {
    return isPreservedAccount() ? initialGoals : [];
  }
};

export default function Goals() {
  const storageKey = getAccountStorageKey(STORAGE_KEY);
  const [goals, setGoals] = useState(() => readStoredGoals(storageKey));
  const [draft, setDraft] = useState(emptyGoal);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(goals));
  }, [goals, storageKey]);

  const averageProgress = useMemo(() => {
    if (!goals.length) return 0;
    return Math.round(goals.reduce((total, goal) => total + (goal.current / goal.target) * 100, 0) / goals.length);
  }, [goals]);

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
  };

  const handleAddGoal = (event) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.target) return;

    const targetNumber = Number(draft.target);
    if (Number.isNaN(targetNumber) || targetNumber <= 0) return;

    const newGoal = {
      id: Date.now(),
      title: draft.title.trim(),
      current: 0,
      target: targetNumber,
      unit: draft.unit || "units",
      due: draft.due || "No deadline",
      tone: "brand",
    };

    setGoals((currentGoals) => [newGoal, ...currentGoals]);
    setDraft(emptyGoal);
  };

  const updateGoal = (id, change) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== id) return goal;
        const nextCurrent = Math.min(goal.target, Math.max(0, goal.current + change));
        return { ...goal, current: nextCurrent };
      })
    );
  };

  return (
    <div className="page-stack">
      <FitnessPageBanner
        eyebrow="Keep moving forward"
        title="Goals"
        description="Set meaningful targets and celebrate every step toward them."
        image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=85"
        imagePosition="center 42%"
      />

      <section className="stats-grid compact-grid" aria-label="Goal summary">
        <article className="metric-card">
          <span className="metric-icon tone-brand">
            <Target size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="metric-label">Active goals</p>
            <strong>{goals.length}</strong>
            <span>Across training and fitness</span>
          </div>
        </article>

        <article className="metric-card">
          <span className="metric-icon tone-sun">
            <TrendingUp size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="metric-label">Average progress</p>
            <strong>{averageProgress}%</strong>
            <span>From current checkpoints</span>
          </div>
        </article>
      </section>

      <div className="page-grid">
        <section className="panel">
          <div className="panel-head panel-head-tight">
            <h3>Goal planner</h3>
          </div>

          <div className="goal-list">
            {goals.map((goal) => {
              const percent = Math.min(100, (goal.current / goal.target) * 100);
              return (
                <article key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <div>
                      <h4>{goal.title}</h4>
                      <span>{goal.due}</span>
                    </div>
                    <strong>
                      {goal.current} / {goal.target} {goal.unit}
                    </strong>
                  </div>

                  <ProgressBar value={goal.current} max={goal.target} label={goal.title} />

                  <div className="goal-actions">
                    <button type="button" className="secondary-button" onClick={() => updateGoal(goal.id, 0.5)}>
                      + 0.5
                    </button>
                    <button type="button" className="secondary-button" onClick={() => updateGoal(goal.id, goal.target)}>
                      Mark done
                    </button>
                    <span className="goal-percent">{Math.round(percent)}%</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head panel-head-tight">
            <h3>Add new goal</h3>
          </div>

          <form className="goal-form" onSubmit={handleAddGoal}>
            <label className="form-field">
              <span>Goal name</span>
              <input name="title" value={draft.title} onChange={handleDraftChange} placeholder="e.g. 10k steps daily" />
            </label>

            <div className="field-grid two-columns">
              <label className="form-field">
                <span>Target</span>
                <input name="target" type="number" min="1" step="0.5" value={draft.target} onChange={handleDraftChange} />
              </label>

              <label className="form-field">
                <span>Unit</span>
                <select name="unit" value={draft.unit} onChange={handleDraftChange}>
                  <option value="kg">kg</option>
                  <option value="km">km</option>
                  <option value="sessions">sessions</option>
                  <option value="min">min</option>
                  <option value="steps">steps</option>
                </select>
              </label>
            </div>

            <label className="form-field">
              <span>Deadline</span>
              <input name="due" value={draft.due} onChange={handleDraftChange} placeholder="Dec 31" />
            </label>

            <button type="submit" className="primary-button full-width">
              <Plus size={16} aria-hidden="true" />
              Create goal
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
