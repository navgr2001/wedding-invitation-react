import { CameraIcon, HeartIcon } from "../components/IconSvgs";

function FinalCtaSection({ finalCta }) {
  return (
    <section id="finalCta" className="finalCta">
      <div className="finalCta__inner">
        <div className="finalCta__icons" aria-hidden="true">
          <span className="finalCta__icon">♡</span>
          <span className="finalCta__spark">✧</span>
          <span className="finalCta__icon">♡</span>
        </div>
        <h2 className="finalCta__title">
          {finalCta.title} <br />
          {finalCta.titleBreak}
        </h2>
        <p className="finalCta__desc">{finalCta.description}</p>
        <div className="finalCta__actions">
          <a className="finalCtaBtn finalCtaBtn--primary" href="/rsvp">
            <span className="finalCtaBtn__icon" aria-hidden="true">
              <HeartIcon width={18} height={18} strokeWidth={1.8} />
            </span>
            <span>RSVP with Love</span>
          </a>
          <a className="finalCtaBtn finalCtaBtn--ghost" href="/gallery">
            <span className="finalCtaBtn__icon" aria-hidden="true">
              <CameraIcon />
            </span>
            <span>Our Photos</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
