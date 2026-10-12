// A circular progress indicator drawn with SVG. Children go in the centre.
export default function ProgressRing({ value, max, size = 140, stroke = 12, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - percent);
  const center = size / 2;

  return (
    <div
      className="ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value} of ${max} completed`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring-track" cx={center} cy={center} r={radius} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}
