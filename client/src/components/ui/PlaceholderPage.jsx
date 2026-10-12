// Shown on pages that are built in later stages
export default function PlaceholderPage({ icon: Icon, title, description }) {
  return (
    <section className="placeholder">
      <span className="placeholder-icon">
        <Icon size={28} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
