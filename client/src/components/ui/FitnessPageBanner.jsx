export default function FitnessPageBanner({ eyebrow, title, description, image, imagePosition = "center" }) {
  return (
    <header className="fitness-page-banner">
      <img
        className="fitness-page-banner-image"
        src={image}
        style={{ objectPosition: imagePosition }}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
      <div className="fitness-page-banner-shade" aria-hidden="true" />
      <div className="fitness-page-banner-content">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="fitness-page-banner-description">{description}</p>
      </div>
    </header>
  );
}
