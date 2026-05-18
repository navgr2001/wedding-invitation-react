import CountdownTimer from "./CountdownTimer";

function WeddingPage() {
  return (
    <main id="home">
      <section className="hero section heroBanner">
        <div aria-hidden="true" className="heroBanner__video">
          <video
            autoPlay
            className="heroBanner__videoEl"
            loop
            muted
            playsInline
            poster="assets/img/couple-photo.svg"
            preload="metadata"
          >
            <source src="assets/video/bannervid.mp4" type="video/mp4" />
          </video>
          <div className="heroBanner__scrim"></div>
        </div>
        <div className="container hero__grid">
          <div className="hero__left">
            <div className="heroPill reveal">
              <span className="heroPill__iconWrap" aria-hidden="true">
                <img
                  className="heroPill__iconImg"
                  src="assets/img/icons/notification.png"
                  alt=""
                />
              </span>
              <span className="heroPill__text">WE’RE GETTING MARRIED</span>
              <span className="heroPill__iconWrap" aria-hidden="true">
                <img
                  className="heroPill__iconImg"
                  src="assets/img/icons/notification.png"
                  alt=""
                />
              </span>
            </div>
            <h1 className="display reveal heroBanner__title">
              Shalom &amp; Dewmini
            </h1>

            <p className="meta reveal">
              Monday, <span className="date">December 10, 2026</span>
            </p>
            <a
              aria-label="Swipe for more"
              className="scrollHint reveal scrollHint--link"
              href="#countdownSection"
              id="btnSwipeMore"
            >
              <span aria-hidden="true" className="scrollHint__mouse"></span>
              <span className="scrollHint__txt">Swipe up for more</span>
            </a>
            <div className="hero__actions reveal">
              <a className="btn btn--primary" href="#rsvp">
                <span aria-hidden="true" className="btn__icon">
                  <svg
                    fill="none"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path d="M22 2 11 13"></path>
                    <path d="M22 2 15 22 11 13 2 9 22 2Z"></path>
                  </svg>
                </span>
                RSVP
              </a>
              <a className="btn btn--ghost" href="#details">
                <span aria-hidden="true" className="btn__icon">
                  <svg
                    fill="none"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </span>
                View Details
              </a>
            </div>
          </div>
          <div className="hero__right reveal">
            <div className="hero__photoCard">
              <div className="hero__badge">
                <span aria-hidden="true" className="hero__badgeIcon">
                  <svg
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                  >
                    <path d="M12 21s-7-4.6-9.5-9C.6 8.2 2.6 5 6 5c2 0 3.3 1.1 4 2 0.7-0.9 2-2 4-2 3.4 0 5.4 3.2 3.5 7-2.5 4.4-9.5 9-9.5 9Z"></path>
                  </svg>
                </span>
                Save the Date
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="hero__bg"></div>
        <div aria-hidden="true" className="hero__sparkles"></div>
      </section>

      <section className="section section--alt" id="countdownSection">
        <div className="container">
          <div className="sectionHeader reveal">
            <h2 className="h2 timelineTitleV2">Counting Down to Forever</h2>
            <p className="muted countdownTagline">
              ♡ Our special day is almost here ♡
            </p>
          </div>
          <CountdownTimer />
        </div>
      </section>

      <section className="section seatFinderSection" id="seatFinder">
        <div className="container seatFinderContainer">
          <div className="seatFinderCard reveal">
            <div className="seatFinderIcon" aria-hidden="true">
              <img src="assets/img/icons/foodblack.png" alt="" />
            </div>
            <h2 className="seatFinderTitle">Find Your Seat</h2>
            <p className="seatFinderText">
              We've saved a special spot just for you. Enter your name on the
              invitation
            </p>
            <form
              className="seatFinderForm"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="srOnly" htmlFor="seatGuestName">
                Enter your name
              </label>
              <input
                id="seatGuestName"
                className="seatFinderInput"
                type="text"
                placeholder="Enter your name..."
                autoComplete="name"
              />
              <button
                className="seatFinderButton"
                type="submit"
                aria-label="Search your seat"
              >
                <img
                  src="assets/img/icons/search.svg"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section" id="details">
        <div className="container">
          <div className="sectionHeader reveal">
            <h2 className="h2 timelineTitleV2">The Happy Couple</h2>
            <p className="muted">
              Two hearts, one love story. Meet the bride and groom who are about
              to begin their forever journey.
            </p>
          </div>
          <div className="coupleGrid">
            <article className="personCard reveal">
              <div className="personCard__img">
                <div className="personCard__badge" aria-hidden="true">
                  <img
                    src="assets/img/icons/crownqueen.png"
                    alt=""
                    className="personCard__badgeIcon"
                  />
                </div>
                <div className="personCard__imgInner">
                  <img alt="Bride portrait" src="assets/img/bride.jpeg" />
                </div>
              </div>
              <div className="personCard__body">
                <h3 className="h3">Dewmini Rodrigo</h3>
                <p className="tag">The Bride</p>
                <p className="muted">Daughter of Mr and Mrs. Rodrigo</p>
              </div>
            </article>
            <article className="personCard reveal">
              <div className="personCard__img">
                <div className="personCard__badge" aria-hidden="true">
                  <img
                    src="assets/img/icons/crownking.png"
                    alt=""
                    className="personCard__badgeIcon"
                  />
                </div>
                <div className="personCard__imgInner">
                  <img alt="Groom portrait" src="assets/img/groom.jpeg" />
                </div>
              </div>
              <div className="personCard__body">
                <h3 className="h3">Shalom Grero</h3>
                <p className="tag">The Groom</p>
                <p className="muted">Son of Mr and Mrs. Grero</p>
              </div>
            </article>
          </div>
          <article className="noteCard noteCard--center reveal">
            <div className="noteCard__heart" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 21s-7-4.6-9.5-9C.6 8.2 2.6 5 6 5c2 0 3.3 1.1 4 2 0.7-0.9 2-2 4-2 3.4 0 5.4 3.2 3.5 7-2.5 4.4-9.5 9-9.5 9Z"></path>
              </svg>
            </div>
            <h3 className="noteCard__title">A Note from the Couple</h3>
            <p className="noteCard__text">
              “Our journey together begins with a promise, and it would mean so
              much for us to have you there to witness it. We invite you to
              celebrate love, togetherness, and new beginnings as we unite in
              marriage. Sharing this moment with you would be an honor and if
              you need any information or help, we’re just a call or message
              away.”
            </p>
          </article>
        </div>
      </section>

      <section className="section section--alt weddingDetailsSection">
        <div className="container">
          <div className="sectionHeader reveal">
            <h2 className="h2 timelineTitleV2">Wedding Details</h2>
            <p className="muted">
              All the important information you need to celebrate our special
              day with us.
            </p>
          </div>
          <div className="weddingCards">
            <article className="weddingCard reveal">
              <div className="weddingCard__icon" aria-hidden="true">
                <img
                  src="assets/img/icons/wedrings.png"
                  alt="Wedding rings icon"
                  className="weddingCard__iconImg weddingCard__iconImg--rings"
                />
              </div>
              <h3 className="weddingCard__title">Church Ceremony</h3>
              <div className="weddingCard__lines">
                <p className="wLine wLine--strong">10th December, 2026</p>
                <p className="wLine">15:30 PM onwards</p>
                <p className="wLine wLine--light">
                  Katunayake Methodist Church
                </p>
              </div>
              <p className="weddingCard__note">
                If you need any further information, please don’t hesitate to
                reach out to us
              </p>
              <a
                className="weddingCard__btn"
                href="https://maps.app.goo.gl/bDSPTL4FdWmHWo5b6"
                target="_blank"
                rel="noopener"
              >
                <span className="btnPin" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 21s7-4.5 7-10a7 7 0 0 0-14 0c0 5.5 7 10 7 10Z"></path>
                    <circle cx="12" cy="11" r="2"></circle>
                  </svg>
                </span>
                View Location
              </a>
            </article>

            <article className="weddingCard reveal">
              <div className="weddingCard__icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="50"
                  height="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M12 2l1.2 4.3L17.5 8l-4.3 1.2L12 13.5l-1.2-4.3L6.5 8l4.3-1.7L12 2Z"></path>
                  <path d="M5 14l.7 2.5L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.5L5 14Z"></path>
                  <path d="M19 13l.7 2.3L22 16l-2.3.7L19 19l-.7-2.3L16 16l2.3-.7L19 13Z"></path>
                </svg>
              </div>
              <h3 className="weddingCard__title">Reception</h3>
              <div className="weddingCard__lines">
                <p className="wLine wLine--strong">10th December, 2026</p>
                <p className="wLine">18:30 PM onwards</p>
                <p className="wLine wLine--light">Ramrich Hotel, Ja -Ela</p>
                <p className="wLine wLine--muted">The Eagle</p>
              </div>
              <a
                className="weddingCard__btn"
                href="https://maps.app.goo.gl/UnUTYUmcdX7yG3z97"
                target="_blank"
                rel="noopener"
              >
                <span className="btnPin" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 21s7-4.5 7-10a7 7 0 0 0-14 0c0 5.5 7 10 7 10Z"></path>
                    <circle cx="12" cy="11" r="2"></circle>
                  </svg>
                </span>
                View Location
              </a>
            </article>
          </div>
        </div>
      </section>
      <section id="details" className="section">
        <div className="timelineWrapV2">
          <h2 className="timelineTitleV2">Wedding Day Timeline</h2>
          <div className="timelineV2" id="timelineV2">
            <ul className="tlList" id="tlList">
              <li className="tlItem tlItem--left">
                <div className="tlCard">
                  <div className="tlTime">15.00 PM</div>
                  <div className="tlText">Groom enters the Church location</div>
                </div>
                <div className="tlNode" aria-hidden="true">
                  <span className="timeline-icon" aria-label="Church">
                    <img
                      src="assets/img/icons/church.png"
                      alt="Church icon"
                      loading="lazy"
                    />
                  </span>
                </div>
                <div></div>
              </li>

              <li className="tlItem tlItem--right">
                <div></div>
                <div className="tlNode" aria-hidden="true">
                  <span className="timeline-icon" aria-label="Church">
                    <img
                      src="assets/img/icons/church.png"
                      alt="Church icon"
                      loading="lazy"
                    />
                  </span>
                </div>
                <div className="tlCard">
                  <div className="tlTime">15.15 PM</div>
                  <div className="tlText">Bride enters the Church location</div>
                </div>
              </li>

              <li className="tlItem tlItem--left">
                <div className="tlCard">
                  <div className="tlTime">15.30 PM</div>
                  <div className="tlText">Church ceremony</div>
                </div>
                <div className="tlNode" aria-hidden="true">
                  <span className="timeline-icon" aria-label="Bible">
                    <img
                      src="assets/img/icons/book.png"
                      alt="Bible icon"
                      loading="lazy"
                    />
                  </span>
                </div>
                <div></div>
              </li>

              <li className="tlItem tlItem--right">
                <div></div>
                <div className="tlNode" aria-hidden="true">
                  <span className="timeline-icon" aria-label="Diamond">
                    <img
                      src="assets/img/icons/gem.png"
                      alt="Diamond icon"
                      loading="lazy"
                    />
                  </span>
                </div>
                <div className="tlCard">
                  <div className="tlTime">18.30 PM</div>
                  <div className="tlText">Couple enters the hall</div>
                </div>
              </li>

              <li className="tlItem tlItem--left">
                <div className="tlCard">
                  <div className="tlTime">19.30 PM</div>
                  <div className="tlText">Dinner</div>
                </div>
                <div className="tlNode" aria-hidden="true">
                  <span className="timeline-icon" aria-label="Dinner">
                    <img
                      src="assets/img/icons/food.png"
                      alt="Dinner icon"
                      loading="lazy"
                    />
                  </span>
                </div>
                <div></div>
              </li>

              <li className="tlItem tlItem--right">
                <div></div>
                <div className="tlNode" aria-hidden="true">
                  <span className="timeline-icon" aria-label="Music">
                    <img
                      src="assets/img/icons/musicnote.png"
                      alt="Music icon"
                      loading="lazy"
                    />
                  </span>
                </div>
                <div className="tlCard">
                  <div className="tlTime">21.00 PM</div>
                  <div className="tlText">
                    First Dance &amp; Dance Floor Opens
                  </div>
                </div>
              </li>

              <li className="tlItem tlItem--left">
                <div className="tlCard">
                  <div className="tlTime">11.00 PM</div>
                  <div className="tlText">Departure</div>
                </div>
                <div className="tlNode" aria-hidden="true">
                  <span className="timeline-icon" aria-label="Departure">
                    <img
                      src="assets/img/icons/justmarried.png"
                      alt="Departure icon"
                      loading="lazy"
                    />
                  </span>
                </div>
                <div></div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section rsvpSection" id="rsvp">
        <div className="container">
          <div className="sectionHeader reveal">
            <h2 className="h2 timelineTitleV2">RSVP</h2>
            <p className="muted">
              We can't wait to celebrate with you! Please let us know if you'll
              be joining us on our special day.
            </p>
          </div>
          <div className="rsvpGrid">
            <div className="rsvpPhotoCard reveal">
              <div className="rsvpPhotoCard__img">
                <img src="assets/img/bride.jpeg" alt="Couple photo" />
              </div>
              <div className="rsvpSaveCard" aria-label="Save the Date">
                <div className="rsvpSaveCard__head">
                  <span className="rsvpSaveCard__icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="30"
                      height="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 21s-7-4.6-9.5-9C.6 8.2 2.6 5 6 5c2 0 3.3 1.1 4 2 0.7-0.9 2-2 4-2 3.4 0 5.4 3.2 3.5 7-2.5 4.4-9.5 9-9.5 9Z"></path>
                    </svg>
                  </span>
                  <span className="rsvpSaveCard__title">Save the Date!</span>
                </div>
                <p className="rsvpSaveCard__text">
                  Your presence will make our wedding day complete. We're so
                  excited to celebrate this special moment with you!
                </p>
              </div>
            </div>

            <div className="rsvpFormCard reveal">
              <form
                className="rsvpForm"
                id="rsvpForm"
                method="POST"
                target="rsvp_hidden_iframe"
                action="https://script.google.com/macros/s/AKfycbwlmSrAlIhdSIlfZlGfIaO_12Rr6GoSt25lV-avFvZz7IcGrCQNec3j9IhIeYQcLBxcBw/exec"
              >
                <label className="fLabel">
                  Name
                  <input
                    className="fInput"
                    type="text"
                    name="name"
                    placeholder="Eg: Namal Perera"
                    required
                  />
                </label>
                <div className="rsvpTwoCols">
                  <label className="fLabel">
                    Will you attend?
                    <select className="fInput" name="attendance" required>
                      <option value="">Select</option>
                      <option value="Yes, I&#x27;ll be there">
                        Yes, I'll be there
                      </option>
                      <option value="Sorry, I can&#x27;t make it">
                        Sorry, I can't make it
                      </option>
                    </select>
                  </label>
                  <label className="fLabel">
                    Number of Guests
                    <input
                      className="fInput"
                      type="number"
                      name="guests"
                      min="1"
                      max="20"
                      placeholder=""
                      required
                    />
                  </label>
                </div>
                <label className="fLabel">
                  Message
                  <textarea
                    className="fInput fTextarea"
                    name="message"
                    rows="5"
                    placeholder="Leave the couple a beautiful note!"
                  ></textarea>
                </label>
                <button className="rsvpSubmitBtn" type="submit">
                  Send RSVP with Love
                </button>
              </form>
              <iframe
                name="rsvp_hidden_iframe"
                id="rsvp_hidden_iframe"
                className="rsvpHiddenFrame"
                title="Hidden RSVP submit frame"
              ></iframe>
              <div className="rsvpSuccess" id="rsvpSuccess" hidden>
                <div className="rsvpSuccess__title">Thank you! 💛</div>
                <div className="rsvpSuccess__text">
                  Your RSVP has been saved successfully.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section wordsSection" id="words">
        <div className="container">
          <div className="sectionHeader reveal">
            <h2 className="h2 timelineTitleV2">Words of Love</h2>
            <p className="muted">
              Hear what our family and friends have to say about our love story.
            </p>
          </div>
          <div className="wordsWrap reveal">
            <div
              className="wordsCard"
              id="wordsCarousel"
              aria-label="Words of Love carousel"
            >
              <div className="wordsTrack" id="wordsTrack"></div>
            </div>
            <div
              className="wordsDots"
              id="wordsDots"
              aria-label="Carousel pagination"
            ></div>
          </div>
        </div>
      </section>

      <section className="section section--alt" id="gallery">
        <div className="container">
          <div className="sectionHeader reveal">
            <h2 className="h2 timelineTitleV2">Moments Before Forever</h2>
            <p className="muted">
              Captured memories of the smiles, dreams, and magic leading up to
              our big day.
            </p>
          </div>
          <div
            aria-label="Photo gallery"
            className="gallery reveal"
            id="galleryGrid"
          >
            <button
              aria-label="Open photo 1"
              className="gallery__item"
              data-src="assets/img/gallery/01.svg"
            >
              <img
                alt="Couple photo 1"
                loading="lazy"
                src="assets/img/gallery/01.svg"
              />
            </button>
            <button
              aria-label="Open photo 2"
              className="gallery__item"
              data-src="assets/img/gallery/02.svg"
            >
              <img
                alt="Couple photo 2"
                loading="lazy"
                src="assets/img/gallery/02.svg"
              />
            </button>
            <button
              aria-label="Open photo 3"
              className="gallery__item"
              data-src="assets/img/gallery/03.svg"
            >
              <img
                alt="Couple photo 3"
                loading="lazy"
                src="assets/img/gallery/03.svg"
              />
            </button>
            <button
              aria-label="Open photo 4"
              className="gallery__item"
              data-src="assets/img/gallery/04.svg"
            >
              <img
                alt="Couple photo 4"
                loading="lazy"
                src="assets/img/gallery/04.svg"
              />
            </button>
            <button
              aria-label="Open photo 5"
              className="gallery__item"
              data-src="assets/img/gallery/05.svg"
            >
              <img
                alt="Couple photo 5"
                loading="lazy"
                src="assets/img/gallery/05.svg"
              />
            </button>
            <button
              aria-label="Open photo 6"
              className="gallery__item"
              data-src="assets/img/gallery/06.svg"
            >
              <img
                alt="Couple photo 6"
                loading="lazy"
                src="assets/img/gallery/06.svg"
              />
            </button>
            <button
              aria-label="Open photo 7"
              className="gallery__item"
              data-src="assets/img/gallery/07.svg"
            >
              <img
                alt="Couple photo 7"
                loading="lazy"
                src="assets/img/gallery/07.svg"
              />
            </button>
            <button
              aria-label="Open photo 8"
              className="gallery__item"
              data-src="assets/img/gallery/08.svg"
            >
              <img
                alt="Couple photo 8"
                loading="lazy"
                src="assets/img/gallery/08.svg"
              />
            </button>
          </div>
        </div>
      </section>

      <section id="finalCta" className="finalCta">
        <div className="finalCta__inner">
          <div className="finalCta__icons" aria-hidden="true">
            <span className="finalCta__icon">♡</span>
            <span className="finalCta__spark">✧</span>
            <span className="finalCta__icon">♡</span>
          </div>
          <h2 className="finalCta__title">
            We Can't Wait to Celebrate <br />
            with You!
          </h2>
          <p className="finalCta__desc">
            Thank you for being part of our love story. Your presence will make
            our wedding day absolutely perfect.
          </p>
          <div className="finalCta__actions">
            <a className="finalCtaBtn finalCtaBtn--primary" href="#rsvp">
              <span className="finalCtaBtn__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.8 4.6c-1.6-1.6-4.2-1.6-5.8 0L12 7.6l-3-3c-1.6-1.6-4.2-1.6-5.8 0s-1.6 4.2 0 5.8l3 3L12 21l5.8-7.6 3-3c1.6-1.6 1.6-4.2 0-5.8z"></path>
                </svg>
              </span>
              <span>RSVP with Love</span>
            </a>
            <a className="finalCtaBtn finalCtaBtn--ghost" href="#gallery">
              <span className="finalCtaBtn__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-2h6l2 2h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </span>
              <span>Our Photos</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default WeddingPage;
