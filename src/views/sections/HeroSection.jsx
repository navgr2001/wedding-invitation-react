import { useEffect, useRef } from "react";
import { HeartIcon, InfoIcon, SendIcon } from "../components/IconSvgs";

function HeroSection({ hero }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const startVideo = async () => {
      video.load();

      try {
        await video.play();
      } catch (error) {
        console.warn("Banner video playback was blocked:", error);
      }
    };

    window.addEventListener("wedding:invite-opened", startVideo, { once: true });

    return () => {
      window.removeEventListener("wedding:invite-opened", startVideo);
    };
  }, []);

  return (
    <section className="hero section heroBanner">
      <div aria-hidden="true" className="heroBanner__video">
        <video
          ref={videoRef}
          className="heroBanner__videoEl"
          loop
          muted
          playsInline
          preload="none"
          poster={hero.videoPoster}
        >
          <source src={hero.video} type="video/mp4" />
        </video>

        <div className="heroBanner__scrim"></div>
      </div>
      <div className="container hero__grid">
        <div className="hero__left">
          <div className="heroPill reveal">
            <HeroPillIcon src={hero.notificationIcon} />
            <span className="heroPill__text">WE’RE GETTING MARRIED</span>
            <HeroPillIcon src={hero.notificationIcon} />
          </div>
          <h1 className="display reveal heroBanner__title">{hero.title}</h1>

          <p className="meta reveal">
            {hero.eventDay}, <span className="date">{hero.eventDate}</span>
          </p>
          <a
            aria-label="Swipe for more"
            className="scrollHint reveal scrollHint--link"
            href="/countdown"
            id="btnSwipeMore"
          >
            <span aria-hidden="true" className="scrollHint__mouse"></span>
            <span className="scrollHint__txt">Swipe up for more</span>
          </a>
          <div className="hero__actions reveal">
            <a className="btn btn--primary" href="/rsvp">
              <span aria-hidden="true" className="btn__icon">
                <SendIcon />
              </span>
              RSVP
            </a>
            <a className="btn btn--ghost" href="/details">
              <span aria-hidden="true" className="btn__icon">
                <InfoIcon />
              </span>
              View Details
            </a>
          </div>
        </div>
        <div className="hero__right reveal">
          <div className="hero__photoCard">
            <div className="hero__badge">
              <span aria-hidden="true" className="hero__badgeIcon">
                <HeartIcon width={18} height={18} strokeWidth={2} />
              </span>
              Save the Date
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="hero__bg"></div>
      <div aria-hidden="true" className="hero__sparkles"></div>
    </section>
  );
}

function HeroPillIcon({ src }) {
  return (
    <span className="heroPill__iconWrap" aria-hidden="true">
      <img className="heroPill__iconImg" src={src} alt="" decoding="async" />
    </span>
  );
}

export default HeroSection;
