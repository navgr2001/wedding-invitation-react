import { PinIcon, SparkleIcon } from "../components/IconSvgs";

function WeddingDetailsSection({ weddingDetails }) {
  return (
    <section className="section section--alt weddingDetailsSection" id="details">
      <div className="container">
        <div className="sectionHeader reveal">
          <h2 className="h2 timelineTitleV2">{weddingDetails.title}</h2>
          <p className="muted">{weddingDetails.description}</p>
        </div>
        <div className="weddingCards">
          {weddingDetails.events.map((event) => (
            <WeddingCard key={event.title} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WeddingCard({ event }) {
  return (
    <article className="weddingCard reveal">
      <div className="weddingCard__icon" aria-hidden="true">
        {event.iconType === "image" ? (
          <img src={event.icon} alt={event.iconAlt} className={event.iconClassName} loading="lazy" decoding="async" />
        ) : (
          <SparkleIcon />
        )}
      </div>
      <h3 className="weddingCard__title">{event.title}</h3>
      <div className="weddingCard__lines">
        {event.lines.map((line) => (
          <p className={line.className} key={`${event.title}-${line.text}`}>
            {line.text}
          </p>
        ))}
      </div>
      {event.note && <p className="weddingCard__note">{event.note}</p>}
      <a
        className="weddingCard__btn"
        href={event.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="btnPin" aria-hidden="true">
          <PinIcon />
        </span>
        View Location
      </a>
    </article>
  );
}

export default WeddingDetailsSection;
