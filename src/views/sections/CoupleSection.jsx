import { HeartIcon } from "../components/IconSvgs";

function CoupleSection({ couple, section }) {
  return (
    <section className="section" id="couple">
      <div className="container">
        <div className="sectionHeader reveal">
          <h2 className="h2 timelineTitleV2">{section.title}</h2>
          <p className="muted">{section.description}</p>
        </div>
        <div className="coupleGrid">
          <PersonCard person={couple.bride} />
          <PersonCard person={couple.groom} />
        </div>
        <article className="noteCard noteCard--center reveal">
          <div className="noteCard__heart" aria-hidden="true">
            <HeartIcon width={34} height={34} strokeWidth={1.8} />
          </div>
          <h3 className="noteCard__title">{section.noteTitle}</h3>
          <p className="noteCard__text">{section.note}</p>
        </article>
      </div>
    </section>
  );
}

function PersonCard({ person }) {
  return (
    <article className="personCard reveal">
      <div className="personCard__img">
        <div className="personCard__badge" aria-hidden="true">
          <img src={person.badgeIcon} alt="" className="personCard__badgeIcon" />
        </div>
        <div className="personCard__imgInner">
          <img alt={person.portraitAlt} src={person.image} />
        </div>
      </div>
      <div className="personCard__body">
        <h3 className="h3">{person.name}</h3>
        <p className="tag">{person.role}</p>
        <p className="muted">{person.family}</p>
      </div>
    </article>
  );
}

export default CoupleSection;
