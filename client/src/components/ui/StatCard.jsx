// tone: "brand" | "sun" | "ink" (controls the icon colour)
export default function StatCard({ icon: Icon, label, value, note, tone = "brand" }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon tone-${tone}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-note">{note}</p>
      </div>
    </div>
  );
}
