// value / max -> a horizontal bar. Turns amber when the goal is complete.
export default function ProgressBar({ value, max, label }) {
  const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div
        className={"progress-fill" + (percent >= 100 ? " complete" : "")}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
