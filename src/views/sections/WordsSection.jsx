function ArrowIcon({ direction }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d={direction === "left" ? "M15 6L9 12L15 18" : "M9 6L15 12L9 18"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function WordsSection({ words }) {
  return (
    <section className="section wordsSection" id="words">
      <div className="container">
        <div className="sectionHeader reveal">
          <h2 className="h2 timelineTitleV2">{words.title}</h2>

          <p className="muted">{words.description}</p>
        </div>

        <div className="wordsWrap reveal">
          <div className="wordsCarouselShell">
            <button
              aria-label="Previous message"
              className="wordsNav wordsNav--previous"
              id="wordsPrevious"
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>

            <div
              aria-label="Words of Love carousel"
              aria-live="polite"
              aria-roledescription="carousel"
              className="wordsCard"
              id="wordsCarousel"
              role="region"
              tabIndex="0"
            >
              <div className="wordsTrack" id="wordsTrack">
                <div className="wordsSlide wordsSlide--loading" role="group">
                  <div className="wordsSlide__inner">
                    <span aria-hidden="true" className="wordsLoadingHeart">
                      ♡
                    </span>

                    <p className="wordsLoadingText">
                      Gathering words of love...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              aria-label="Next message"
              className="wordsNav wordsNav--next"
              id="wordsNext"
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>

          <div
            aria-label="Carousel pagination"
            className="wordsDots"
            id="wordsDots"
          />

          <p className="wordsSwipeHint">
            <span aria-hidden="true">↔</span>
            Swipe to view more wishes
          </p>
        </div>
      </div>
    </section>
  );
}

export default WordsSection;
