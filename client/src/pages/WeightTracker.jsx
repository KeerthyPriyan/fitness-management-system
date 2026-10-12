import { useEffect, useMemo, useState } from "react";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import FitnessPageBanner from "../components/ui/FitnessPageBanner.jsx";
import { getAccountStorageKey, isPreservedAccount } from "../utils/accountStorage.js";

const STORAGE_KEY = "fittrack-weight-entries";

const initialEntries = [
  { id: 1, date: "2026-09-03", value: 75.7 },
  { id: 2, date: "2026-09-10", value: 75.1 },
  { id: 3, date: "2026-09-17", value: 74.5 },
  { id: 4, date: "2026-09-24", value: 73.9 },
  { id: 5, date: "2026-10-01", value: 72.8 },
  { id: 6, date: "2026-10-08", value: 72.4 },
];

const readStoredEntries = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : isPreservedAccount() ? initialEntries : [];
  } catch {
    return isPreservedAccount() ? initialEntries : [];
  }
};

const formatDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function WeightTracker() {
  const storageKey = getAccountStorageKey(STORAGE_KEY);
  const [entries, setEntries] = useState(() => readStoredEntries(storageKey));
  const [draft, setDraft] = useState({ date: "2026-10-10", value: "72.0" });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => new Date(a.date) - new Date(b.date)), [entries]);

  const currentWeight = sortedEntries[sortedEntries.length - 1]?.value ?? 0;
  const previousWeight = sortedEntries[sortedEntries.length - 2]?.value ?? currentWeight;
  const delta = currentWeight - previousWeight;
  const averageWeight = sortedEntries.length
    ? sortedEntries.reduce((sum, entry) => sum + entry.value, 0) / sortedEntries.length
    : 0;
  const minWeight = sortedEntries.length ? Math.min(...sortedEntries.map((entry) => entry.value)) : 0;
  const maxWeight = sortedEntries.length ? Math.max(...sortedEntries.map((entry) => entry.value)) : 0;

  const chartValues = sortedEntries.map((entry) => {
    const range = maxWeight - minWeight || 1;
    return {
      ...entry,
      height: ((entry.value - minWeight) / range) * 100,
    };
  });

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
  };

  const handleAddEntry = (event) => {
    event.preventDefault();
    const nextValue = Number(draft.value);
    if (!draft.date || Number.isNaN(nextValue)) return;

    const newEntry = {
      id: Date.now(),
      date: draft.date,
      value: nextValue,
    };

    setEntries((currentEntries) => [...currentEntries, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setDraft({ date: draft.date, value: "" });
  };

  return (
    <div className="page-stack">
      <FitnessPageBanner
        eyebrow="Body metrics"
        title="Weight tracker"
        description="Track your progress over time and focus on healthy, steady changes."
        image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=85"
        imagePosition="center 40%"
      />

      <section className="stats-grid compact-grid" aria-label="Weight statistics">
        <article className="metric-card">
          <span className="metric-icon tone-brand">
            <Scale size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="metric-label">Current</p>
            <strong>{sortedEntries.length ? `${currentWeight.toFixed(1)} kg` : "—"}</strong>
            <span>Latest bodyweight</span>
          </div>
        </article>

        <article className="metric-card">
          <span className="metric-icon tone-sun">
            {delta <= 0 ? <TrendingDown size={18} aria-hidden="true" /> : <TrendingUp size={18} aria-hidden="true" />}
          </span>
          <div>
            <p className="metric-label">Trend</p>
            <strong>{sortedEntries.length > 1 ? `${Math.abs(delta).toFixed(1)} kg` : "—"}</strong>
            <span>{sortedEntries.length > 1 ? delta <= 0 ? "Lost since last check-in" : "Gained since last check-in" : "Add two entries to see a trend"}</span>
          </div>
        </article>

        <article className="metric-card">
          <span className="metric-icon tone-brand">
            <TrendingUp size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="metric-label">Average</p>
            <strong>{sortedEntries.length ? `${averageWeight.toFixed(1)} kg` : "—"}</strong>
            <span>Across all entries</span>
          </div>
        </article>
      </section>

      <div className="page-grid">
        <section className="panel">
          <div className="panel-head panel-head-tight">
            <h3>Weight trend</h3>
          </div>

          <div className="weight-chart" aria-label="Weight history chart">
            <div className="chart-grid">
              {chartValues.map((entry) => (
                <div key={entry.id} className="chart-column">
                  <div className="chart-bar-wrap">
                    <span className="chart-bar" style={{ height: `${Math.max(14, entry.height)}%` }} />
                  </div>
                  {!sortedEntries.length && <p className="empty-state">No weight entries yet. Add your first check-in.</p>}
                  <small>{formatDate(entry.date)}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="log-list">
            {sortedEntries.slice().reverse().map((entry) => (
              <div key={entry.id} className="log-row">
                <span>{formatDate(entry.date)}</span>
                <strong>{entry.value.toFixed(1)} kg</strong>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head panel-head-tight">
            <h3>Log weight</h3>
          </div>

          <form className="goal-form" onSubmit={handleAddEntry}>
            <label className="form-field">
              <span>Date</span>
              <input type="date" name="date" value={draft.date} onChange={handleDraftChange} />
            </label>

            <label className="form-field">
              <span>Weight (kg)</span>
              <input type="number" name="value" min="30" max="200" step="0.1" value={draft.value} onChange={handleDraftChange} />
            </label>

            <button type="submit" className="primary-button full-width">
              Add entry
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
